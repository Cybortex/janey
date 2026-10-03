import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getHoursAndAvailability = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("availability").collect();
  },
});

export const updateWeeklyHours = mutation({
  args: {
    dayOfWeek: v.number(),
    openTime: v.string(),
    closeTime: v.string(),
    isClosed: v.boolean(),
    isSundayBookingOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("availability")
      .withIndex("by_day", (q) => q.eq("dayOfWeek", args.dayOfWeek))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        openTime: args.openTime,
        closeTime: args.closeTime,
        isClosed: args.isClosed,
        isSundayBookingOnly: args.isSundayBookingOnly,
      });
    } else {
      await ctx.db.insert("availability", {
        type: "weekly",
        dayOfWeek: args.dayOfWeek,
        openTime: args.openTime,
        closeTime: args.closeTime,
        isClosed: args.isClosed,
        isSundayBookingOnly: args.isSundayBookingOnly,
      });
    }
    return { success: true };
  },
});

export const blockDate = mutation({
  args: {
    date: v.string(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        isClosed: true,
        note: args.note,
      });
    } else {
      await ctx.db.insert("availability", {
        type: "blocked",
        date: args.date,
        isClosed: true,
        note: args.note,
      });
    }
    return { success: true };
  },
});

export const unblockDate = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("availability")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .first();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return { success: true };
  },
});

export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    name: v.string(),
    durationMinutes: v.number(),
    price: v.optional(v.number()),
    depositRequired: v.boolean(),
    depositAmount: v.optional(v.number()),
    active: v.boolean(),
    blurb: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.serviceId, {
      name: args.name,
      durationMinutes: args.durationMinutes,
      price: args.price,
      depositRequired: args.depositRequired,
      depositAmount: args.depositAmount,
      active: args.active,
      blurb: args.blurb,
    });
    return { success: true };
  },
});

export const addStylist = mutation({
  args: {
    name: v.string(),
    specialties: v.array(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("stylists", {
      name: args.name,
      specialties: args.specialties,
      bio: args.bio,
      active: true,
    });
  },
});

export const toggleStylistActive = mutation({
  args: { stylistId: v.id("stylists"), active: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.stylistId, { active: args.active });
    return { success: true };
  },
});
