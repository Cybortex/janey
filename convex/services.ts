import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { SERVICES } from "../lib/site";

// Initial seed helper for services and default hours
export const seedInitialData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingServices = await ctx.db.query("services").collect();
    if (existingServices.length === 0) {
      for (const s of SERVICES) {
        // Map category
        const cat = s.cats.includes("women") ? "women" : s.cats.includes("men") ? "men" : "skin";
        // Long braiding session defaults to depositRequired: true
        const isBraids = s.slug === "braids";
        await ctx.db.insert("services", {
          slug: s.slug,
          name: s.name,
          category: cat,
          durationMinutes: isBraids ? 180 : 60,
          depositRequired: isBraids,
          depositAmount: isBraids ? 5000 : undefined,
          active: true,
          blurb: s.blurb,
        });
      }
    }

    const existingAvailability = await ctx.db.query("availability").collect();
    if (existingAvailability.length === 0) {
      // Mon-Thu 9:00-19:00 (days 1, 2, 3, 4)
      for (let day = 1; day <= 4; day++) {
        await ctx.db.insert("availability", {
          type: "weekly",
          dayOfWeek: day,
          openTime: "09:00",
          closeTime: "19:00",
          isClosed: false,
          isSundayBookingOnly: false,
        });
      }
      // Fri 10:00-19:00 (day 5)
      await ctx.db.insert("availability", {
        type: "weekly",
        dayOfWeek: 5,
        openTime: "10:00",
        closeTime: "19:00",
        isClosed: false,
        isSundayBookingOnly: false,
      });
      // Sat 9:00-19:00 (day 6)
      await ctx.db.insert("availability", {
        type: "weekly",
        dayOfWeek: 6,
        openTime: "09:00",
        closeTime: "19:00",
        isClosed: false,
        isSundayBookingOnly: false,
      });
      // Sun booking only (day 0)
      await ctx.db.insert("availability", {
        type: "weekly",
        dayOfWeek: 0,
        openTime: "10:00",
        closeTime: "18:00",
        isClosed: false,
        isSundayBookingOnly: true,
        note: "Sundays are by manual owner approval only",
      });
    }

    const existingSettings = await ctx.db.query("settings").filter((q) => q.eq(q.field("key"), "business_info")).first();
    if (!existingSettings) {
      await ctx.db.insert("settings", {
        key: "business_info",
        value: {
          name: "Janey Radiance Salon & Spa",
          address: "164 Herbert Macaulay Way, Adekunle Sabo, Yaba, Lagos",
          phone: "+2348105549826",
          sundayApprovalRequired: true,
          depositEnabled: true,
        },
      });
    }

    return { success: true };
  },
});

export const listServices = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("services");
    if (args.activeOnly ?? true) {
      return await q.withIndex("by_active", (q) => q.eq("active", true)).collect();
    }
    return await q.collect();
  },
});

export const listStylists = query({
  args: { activeOnly: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query("stylists");
    if (args.activeOnly ?? true) {
      return await q.withIndex("by_active", (q) => q.eq("active", true)).collect();
    }
    return await q.collect();
  },
});
