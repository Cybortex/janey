import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const trackEvent = mutation({
  args: {
    type: v.string(), // "click_call", "click_whatsapp", "click_book", "view_offer"
    target: v.optional(v.string()),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    await ctx.db.insert("events", {
      type: args.type,
      target: args.target,
      source: args.source,
      referrer: args.referrer,
      timestamp: Date.now(),
      date: dateStr,
    });
    return { success: true };
  },
});

export const getEventStats = query({
  args: {
    startDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db.query("events").collect();
    if (args.startDate) {
      events = events.filter((e) => e.date >= (args.startDate as string));
    }

    const byType: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byDate: Record<string, number> = {};

    for (const e of events) {
      byType[e.type] = (byType[e.type] ?? 0) + 1;
      const s = e.source ?? "direct";
      bySource[s] = (bySource[s] ?? 0) + 1;
      byDate[e.date] = (byDate[e.date] ?? 0) + 1;
    }

    return {
      total: events.length,
      byType,
      bySource,
      byDate,
    };
  },
});
