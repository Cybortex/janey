import { NextRequest, NextResponse } from "next/server";
import { verifyPaystackTransaction } from "@/lib/paystack";
import { ConvexHttpClient } from "convex/browser";
import { internal } from "@/convex/_generated/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference") || searchParams.get("ref");

    if (!reference) {
      return NextResponse.json({ error: "Reference missing" }, { status: 400 });
    }

    const paystackResult = await verifyPaystackTransaction(reference);

    if (paystackResult.status && paystackResult.data?.status === "success") {
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
      if (convexUrl) {
        const client = new ConvexHttpClient(convexUrl);
        await client.mutation(internal.admin.updateDepositStatus, {
          reference,
          paystackReference: paystackResult.data.id?.toString() ?? reference,
          paid: true,
        });
      }

      return NextResponse.json({
        status: "success",
        paid: true,
        amount: paystackResult.data.amount / 100,
      });
    }

    return NextResponse.json({
      status: "pending",
      paid: false,
      message: paystackResult.data?.gateway_response || "Payment pending or unconfirmed",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to verify transaction" }, { status: 500 });
  }
}
