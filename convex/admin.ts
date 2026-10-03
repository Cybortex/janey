import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getBookingByRef = query({
  args: { reference: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookings")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();
  },
});

export const updateDepositStatus = internalMutation({
  args: {
    reference: v.string(),
    paystackReference: v.string(),
    paid: v.boolean(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_reference", (q) => q.eq("reference", args.reference))
      .first();

    if (!booking) return { success: false, reason: "Booking not found" };

    if (args.paid) {
      await ctx.db.patch(booking._id, {
        depositPaid: true,
        paystackReference: args.paystackReference,
        paidAt: Date.now(),
        status: booking.isSunday ? "pending_approval" : "confirmed",
      });
    }

    return { success: true };
  },
});

// Admin Queries & Mutations
export const listAllBookings = query({
  args: {
    status: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let bookings = await ctx.db.query("bookings").collect();
    if (args.status) {
      bookings = bookings.filter((b) => b.status === args.status);
    }
    if (args.date) {
      bookings = bookings.filter((b) => b.date === args.date);
    }
    return bookings.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending_approval"),
      v.literal("pending_deposit"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: args.status });
    return { success: true };
  },
});

export const rescheduleBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    date: v.string(),
    startTime: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    const service = await ctx.db.get(booking.serviceId);
    const duration = service?.durationMinutes ?? 60;
    const [h, m] = args.startTime.split(":").map(Number);
    const endMinutes = h * 60 + m + duration;
    const endH = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    const endTime = `${endH.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`;

    await ctx.db.patch(args.bookingId, {
      date: args.date,
      startTime: args.startTime,
      endTime,
    });
    return { success: true };
  },
});

export const markPaid = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      depositPaid: true,
      paidAt: Date.now(),
      status: "confirmed",
    });
    return { success: true };
  },
});

export const recordReminderSent = mutation({
  args: { bookingId: v.id("bookings") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      reminderSent: true,
      reminderSentAt: Date.now(),
    });
    return { success: true };
  },
});
