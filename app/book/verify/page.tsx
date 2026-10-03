import { Suspense } from "react";
import VerifyBookingClient from "./VerifyBookingClient";

export default function VerifyBookingPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg p-10 text-center">Loading payment verification...</div>}>
      <VerifyBookingClient />
    </Suspense>
  );
}
