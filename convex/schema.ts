import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  services: defineTable({
    slug: v.string(),
    name: v.string(),
    category: v.union(v.literal("women"), v.literal("men"), v.literal("skin")),
    durationMinutes: v.number(), // e.g. 30, 60, 180, 240
    price: v.optional(v.number()), // in Naira (NGN), optional until owner confirms
    depositRequired: v.boolean(),
    depositAmount: v.optional(v.number()), // e.g. 5000 NGN
    active: v.boolean(),
    blurb: v.string(),
  })
    .index("by_category", ["category"])
    .index("by_active", ["active"])
    .index("by_slug", ["slug"]),

  stylists: defineTable({
    name: v.string(),
    bio: v.optional(v.string()),
    active: v.boolean(),
    specialties: v.array(v.string()), // slugs or category names
  }).index("by_active", ["active"]),

  availability: defineTable({
    // Weekly hours configuration or custom date rules
    type: v.union(v.literal("weekly"), v.literal("override"), v.literal("blocked")),
    dayOfWeek: v.optional(v.number()), // 0 for Sun, 1 for Mon, ..., 6 for Sat
    date: v.optional(v.string()), // "YYYY-MM-DD" for overrides/blocks
    openTime: v.optional(v.string()), // "09:00"
    closeTime: v.optional(v.string()), // "19:00"
    isClosed: v.boolean(),
    isSundayBookingOnly: v.optional(v.boolean()),
    note: v.optional(v.string()),
  })
    .index("by_day", ["dayOfWeek"])
    .index("by_date", ["date"]),

  bookings: defineTable({
    reference: v.string(), // e.g. "JR-XXXXXX"
    serviceId: v.id("services"),
    serviceName: v.string(),
    stylistId: v.optional(v.id("stylists")),
    stylistName: v.optional(v.string()),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.optional(v.string()),
    date: v.string(), // "YYYY-MM-DD"
    startTime: v.string(), // "09:30"
    endTime: v.string(), // "11:30" (calculated from duration)
    status: v.union(
      v.literal("pending_approval"), // e.g. Sundays
      v.literal("pending_deposit"), // if deposit required
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    isSunday: v.boolean(),
    notes: v.optional(v.string()),
    // Deposit / Paystack details
    depositRequired: v.boolean(),
    depositAmount: v.optional(v.number()),
    depositPaid: v.boolean(),
    paystackReference: v.optional(v.string()),
    paidAt: v.optional(v.number()),
    // Reminders
    reminderSent: v.optional(v.boolean()),
    reminderSentAt: v.optional(v.number()),
    // Analytics & Attribution
    source: v.optional(v.string()),
    utmSource: v.optional(v.string()),
    utmMedium: v.optional(v.string()),
    utmCampaign: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_reference", ["reference"])
    .index("by_status", ["status"])
    .index("by_stylist_date", ["stylistId", "date"]),

  settings: defineTable({
    key: v.string(), // e.g. "business_hours", "deposit_policy", "admin_password_hash"
    value: v.any(),
  }).index("by_key", ["key"]),

  // Phase 4: Event Tracking
  events: defineTable({
    type: v.string(), // "click_call", "click_whatsapp", "click_book", "view_offer"
    target: v.optional(v.string()), // offer slug, phone number, etc.
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    timestamp: v.number(),
    date: v.string(), // "YYYY-MM-DD" for fast aggregation
  })
    .index("by_type", ["type"])
    .index("by_date", ["date"]),
});
