import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Time helper utilities
function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${h.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

export const getAvailableSlots = query({
  args: {
    date: v.string(), // "YYYY-MM-DD"
    serviceId: v.id("services"),
    stylistId: v.optional(v.id("stylists")),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) return { error: "Service not found", slots: [] };

    const duration = service.durationMinutes; // in minutes

    // Check blocked dates or overrides
    const dateOverride = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (dateOverride?.isClosed) {
      return { closed: true, reason: dateOverride.note ?? "Salon closed on this date", slots: [] };
    }

    // Determine Day of week
    // parse date components directly to avoid timezone discrepancies
    const [year, month, day] = args.date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);
    const dayOfWeek = dateObj.getDay();
    const isSunday = dayOfWeek === 0;

    let openTimeStr = "09:00";
    let closeTimeStr = "19:00";
    let isSundayBookingOnly = isSunday;

    if (dateOverride) {
      if (dateOverride.openTime) openTimeStr = dateOverride.openTime;
      if (dateOverride.closeTime) closeTimeStr = dateOverride.closeTime;
    } else {
      const weekly = await ctx.db
        .query("availability")
        .withIndex("by_day", (q) => q.eq("dayOfWeek", dayOfWeek))
        .first();

      if (weekly) {
        if (weekly.isClosed) return { closed: true, reason: "Closed on this day", slots: [] };
        if (weekly.openTime) openTimeStr = weekly.openTime;
        if (weekly.closeTime) closeTimeStr = weekly.closeTime;
        if (weekly.isSundayBookingOnly) isSundayBookingOnly = true;
      }
    }

    const openMin = timeToMinutes(openTimeStr);
    const closeMin = timeToMinutes(closeTimeStr);

    // Fetch existing active bookings for this date
    const allBookings = await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const activeBookings = allBookings.filter(
      (b) => b.status === "confirmed" || b.status === "pending_deposit" || b.status === "pending_approval"
    );

    // If specific stylist selected, filter by stylist or unassigned
    const relevantBookings = args.stylistId
      ? activeBookings.filter((b) => !b.stylistId || b.stylistId === args.stylistId)
      : activeBookings;

    // Generate slots in 30 minute steps
    const slots: { time: string; available: boolean }[] = [];
    const step = 30; // 30 min intervals

    for (let current = openMin; current + duration <= closeMin; current += step) {
      const slotStart = current;
      const slotEnd = current + duration;

      // Check overlap
      const hasConflict = relevantBookings.some((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        // Overlap if slotStart < bEnd and slotEnd > bStart
        return slotStart < bEnd && slotEnd > bStart;
      });

      slots.push({
        time: minutesToTime(slotStart),
        available: !hasConflict,
      });
    }

    return {
      closed: false,
      isSunday: isSundayBookingOnly,
      duration,
      depositRequired: service.depositRequired,
      depositAmount: service.depositAmount,
      slots,
    };
  },
});

// Transactional booking mutation to strictly prevent double-booking
export const createBooking = mutation({
  args: {
    serviceId: v.id("services"),
    stylistId: v.optional(v.id("stylists")),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    date: v.string(), // "YYYY-MM-DD"
    startTime: v.string(), // "09:30"
    notes: v.optional(v.string()),
    source: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    let stylistName: string | undefined;
    if (args.stylistId) {
      const stylist = await ctx.db.get(args.stylistId);
      stylistName = stylist?.name;
    }

    const duration = service.durationMinutes;
    const startMin = timeToMinutes(args.startTime);
    const endMin = startMin + duration;
    const endTime = minutesToTime(endMin);

    // Day of week check for Sunday
    const [year, month, day] = args.date.split("-").map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0);
    const isSunday = dateObj.getDay() === 0;

    // Check for conflicts inside the transaction
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const conflicts = existingBookings.filter((b) => {
      if (b.status === "cancelled" || b.status === "no_show") return false;
      // If a stylist is specified, only conflict if same stylist or general chair
      if (args.stylistId && b.stylistId && b.stylistId !== args.stylistId) {
        return false;
      }
      const bStart = timeToMinutes(b.startTime);
      const bEnd = timeToMinutes(b.endTime);
      return startMin < bEnd && endMin > bStart;
    });

    if (conflicts.length > 0) {
      throw new Error("This slot is no longer available. Please select another time.");
    }

    // Generate reference code JR-XXXXXX
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const reference = `JR-${randomChars}`;

    let status: "pending_approval" | "pending_deposit" | "confirmed" = "confirmed";
    if (isSunday) {
      status = "pending_approval";
    } else if (service.depositRequired && (service.depositAmount ?? 0) > 0) {
      status = "pending_deposit";
    }

    const bookingId = await ctx.db.insert("bookings", {
      reference,
      serviceId: args.serviceId,
      serviceName: service.name,
      stylistId: args.stylistId,
      stylistName,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      date: args.date,
      startTime: args.startTime,
      endTime,
      status,
      isSunday,
      notes: args.notes,
      depositRequired: service.depositRequired,
      depositAmount: service.depositAmount,
      depositPaid: false,
      source: args.source,
      utmSource: args.utmSource,
      utmMedium: args.utmMedium,
      utmCampaign: args.utmCampaign,
      createdAt: Date.now(),
    });

    return {
      bookingId,
      reference,
      status,
      isSunday,
      depositRequired: service.depositRequired,
      depositAmount: service.depositAmount,
    };
  },
});
