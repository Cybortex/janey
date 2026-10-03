"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { SITE } from "@/lib/site";
import { btn } from "@/lib/ui";

export default function VerifyBookingClient() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || searchParams.get("reference");
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      setMsg("No booking reference provided.");
      return;
    }

    async function checkPayment() {
      try {
        const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(ref as string)}`);
        const data = await res.json();
        if (data.status === "success" || data.paid) {
          setVerified(true);
          setMsg("Deposit confirmed! Your booking is locked in.");
        } else {
          setMsg(data.message || "Payment could not be verified automatically. You can confirm via WhatsApp.");
        }
      } catch {
        setMsg("Verification check completed. Please reach out via WhatsApp with your reference.");
      } finally {
        setLoading(false);
      }
    }

    checkPayment();
  }, [ref]);

  const waMsg = `Hello Janey Radiance, I completed my booking deposit for reference ${ref}.`;
  const waUrl = `${SITE.wa}?text=${encodeURIComponent(waMsg)}`;

  return (
    <section className="mx-auto max-w-lg px-5 py-16 text-center">
      <div className="rounded-3xl border border-gold/70 bg-white p-8 shadow-sm">
        {loading ? (
          <div>
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gold border-t-transparent" />
            <p className="mt-4 font-display text-2xl font-semibold">Verifying your payment...</p>
          </div>
        ) : (
          <div>
            <h1 className="font-display text-4xl font-semibold text-plum">
              {verified ? "Payment Confirmed!" : "Payment Status"}
            </h1>
            <p className="mt-3 text-lg text-plum/80">{msg}</p>
            {ref && (
              <p className="mt-2 text-sm text-gold-deep font-mono">Reference: {ref}</p>
            )}

            <div className="mt-8 flex flex-col gap-3">
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className={btn}>
                Notify us on WhatsApp
              </a>
              <Link href="/" className="text-sm text-plum/70 underline underline-offset-4 hover:text-plum mt-2">
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
