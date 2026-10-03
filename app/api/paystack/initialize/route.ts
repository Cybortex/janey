import { NextRequest, NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { initializePaystackPayment } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, email } = body;

    if (!reference) {
      return NextResponse.json({ error: "Booking reference required" }, { status: 400 });
    }

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
      return NextResponse.json({ error: "Convex backend not configured" }, { status: 500 });
    }

    const client = new ConvexHttpClient(convexUrl);
    const booking = await client.query(api.admin.getBookingByRef, { reference });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!booking.depositRequired || !booking.depositAmount) {
      return NextResponse.json({ error: "Deposit not required for this booking" }, { status: 400 });
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const callbackUrl = `${siteUrl}/book/verify?ref=${encodeURIComponent(reference)}`;

    const paystackRes = await initializePaystackPayment({
      email: email || booking.customerEmail || "client@janeyradiance.com",
      amountInNaira: booking.depositAmount,
      reference,
      callbackUrl,
      metadata: {
        bookingId: booking._id,
        service: booking.serviceName,
        customerName: booking.customerName,
        phone: booking.customerPhone,
      },
    });

    if (!paystackRes.status || !paystackRes.data) {
      return NextResponse.json(
        { error: paystackRes.message || "Failed to initialize payment" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorizationUrl: paystackRes.data.authorization_url,
      reference: paystackRes.data.reference,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
