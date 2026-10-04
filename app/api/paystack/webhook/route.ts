import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export async function POST(req: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "PAYSTACK_SECRET_KEY not configured" }, { status: 500 });
  }

  const paystackSignature = req.headers.get("x-paystack-signature");
  if (!paystackSignature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const bodyText = await req.text();
  const hash = crypto.createHmac("sha512", secretKey).update(bodyText).digest("hex");

  if (hash !== paystackSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(bodyText);

  // Paystack charge.success event
  if (payload.event === "charge.success") {
    const data = payload.data;
    const bookingReference = data.reference;

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const client = new ConvexHttpClient(convexUrl);
      await client.mutation(api.admin.updateDepositStatus, {
        reference: bookingReference,
        paystackReference: data.id?.toString() ?? bookingReference,
        paid: data.status === "success",
      });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
