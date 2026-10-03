"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SERVICES, SITE } from "@/lib/site";
import { btn, field } from "@/lib/ui";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const FALLBACK_TIMES = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];

export default function BookingForm({ initialService }: { initialService?: string }) {
  const searchParams = useSearchParams();
  const [selectedServiceName, setSelectedServiceName] = useState(initialService ?? SERVICES[0].name);
  const [selectedStylistId, setSelectedStylistId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [sunday, setSunday] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    reference: string;
    isSunday: boolean;
    depositRequired: boolean;
    depositAmount?: number;
  } | null>(null);

  // Read UTM parameters
  const utmSource = searchParams.get("utm_source") || undefined;
  const utmMedium = searchParams.get("utm_medium") || undefined;
  const utmCampaign = searchParams.get("utm_campaign") || undefined;

  // Convex live queries (will be undefined if Convex is offline / local preview)
  const convexServices = useQuery(api.services?.listServices, { activeOnly: true });
  const convexStylists = useQuery(api.services?.listStylists, { activeOnly: true });

  const activeServiceObj = convexServices?.find((s: any) => s.name === selectedServiceName) ||
    SERVICES.find((s) => s.name === selectedServiceName);

  const serviceId = activeServiceObj && "_id" in activeServiceObj ? activeServiceObj._id : undefined;

  // Fetch slot availability based on service duration and existing bookings
  const availabilityData = useQuery(
    api.bookings?.getAvailableSlots,
    serviceId && date
      ? {
          serviceId,
          date,
          stylistId: selectedStylistId ? (selectedStylistId as any) : undefined,
        }
      : "skip"
  );

  const createBookingMutation = useMutation(api.bookings?.createBooking);
  const trackEventMutation = useMutation(api.events?.trackEvent);

  useEffect(() => {
    if (date) {
      const isSun = new Date(date + "T12:00:00").getDay() === 0;
      setSunday(isSun);
    }
  }, [date]);

  const availableSlots: { time: string; available: boolean }[] =
    availabilityData?.slots || FALLBACK_TIMES.map((t) => ({ time: t, available: true }));

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!time) {
      setErr("Please pick a time slot to continue.");
      return;
    }

    setLoading(true);
    setErr("");

    try {
      if (trackEventMutation) {
        trackEventMutation({
          type: "submit_book",
          target: selectedServiceName,
          source: utmSource || "web_booking",
        }).catch(() => {});
      }

      // If Convex is available and serviceId exists in DB, invoke transactional createBooking
      if (createBookingMutation && serviceId) {
        const res = await createBookingMutation({
          serviceId,
          stylistId: selectedStylistId ? (selectedStylistId as any) : undefined,
          customerName: name,
          customerPhone: phone,
          customerEmail: email || undefined,
          date,
          startTime: time,
          notes: notes || undefined,
          source: "direct",
          utmSource,
          utmMedium,
          utmCampaign,
        });

        setConfirmedBooking({
          reference: res.reference,
          isSunday: res.isSunday,
          depositRequired: res.depositRequired,
          depositAmount: res.depositAmount,
        });
      } else {
        // Fallback reference code and WhatsApp confirmation
        const randomRef = `JR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const msg = `Hello Janey Radiance, I'd like to book ${selectedServiceName} on ${date} at ${time}. Ref: ${randomRef}. Name: ${name}. Phone: ${phone}.`;
        window.open(`${SITE.wa}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
        setConfirmedBooking({
          reference: randomRef,
          isSunday: sunday,
          depositRequired: false,
        });
      }
    } catch (error: any) {
      setErr(error.message || "Could not complete booking. Please try again or chat via WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  // After booking screen: WhatsApp confirmation fallback & Paystack deposit option
  if (confirmedBooking) {
    const waMessage = `Hello Janey Radiance, my booking reference is ${confirmedBooking.reference} for ${selectedServiceName} on ${date} at ${time}. Name: ${name}.`;
    const waUrl = `${SITE.wa}?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="rounded-2xl border border-gold/70 bg-white p-6 md:p-8 max-w-lg shadow-sm">
        <h2 className="font-display text-3xl font-semibold text-plum">
          {confirmedBooking.isSunday ? "Request Received (Sunday Approval)" : "Booking Submitted!"}
        </h2>
        <p className="mt-2 text-plum/80">
          Booking Reference: <strong className="text-rose text-lg tracking-wider">{confirmedBooking.reference}</strong>
        </p>

        {confirmedBooking.isSunday && (
          <p className="mt-3 rounded-lg bg-blush p-3 text-sm text-gold-deep border border-gold/40">
            Sundays are strictly bookings only and subject to salon manager confirmation. We will reach out to you on WhatsApp to approve your slot.
          </p>
        )}

        {confirmedBooking.depositRequired && confirmedBooking.depositAmount && (
          <div className="mt-5 rounded-xl border border-gold p-4 bg-blush/40">
            <p className="font-medium text-plum">Deposit Required for this session</p>
            <p className="text-sm text-plum/75 mt-1">
              A deposit of <strong>₦{confirmedBooking.depositAmount.toLocaleString()}</strong> secures this extended slot.
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  const res = await fetch("/api/paystack/initialize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      reference: confirmedBooking.reference,
                      email: email || `${phone.replace(/\D/g, "")}@janeyradiance.com`,
                    }),
                  });
                  const data = await res.json();
                  if (data.authorizationUrl) {
                    window.location.href = data.authorizationUrl;
                  } else {
                    alert(data.error || "Payment gateway currently offline. Please confirm via WhatsApp.");
                  }
                } catch {
                  window.open(waUrl, "_blank", "noopener");
                }
              }}
              className={`${btn} mt-3 w-full`}
            >
              Pay ₦{confirmedBooking.depositAmount.toLocaleString()} Deposit via Paystack
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className={`${btn} text-center`}>
            Confirm with us on WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setConfirmedBooking(null)}
            className="text-sm text-plum/70 underline underline-offset-4 hover:text-plum mt-2"
          >
            Book another session
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} className="grid max-w-md gap-4">
      <label className="text-sm font-medium text-plum">
        Service
        <select
          name="service"
          value={selectedServiceName}
          onChange={(e) => setSelectedServiceName(e.target.value)}
          className={field}
        >
          {convexServices && convexServices.length > 0
            ? convexServices.map((s: any) => (
                <option key={s.slug} value={s.name}>
                  {s.name} ({s.durationMinutes} mins)
                </option>
              ))
            : SERVICES.map((s) => (
                <option key={s.slug} value={s.name}>
                  {s.name}
                </option>
              ))}
        </select>
      </label>

      {convexStylists && convexStylists.length > 0 && (
        <label className="text-sm font-medium text-plum">
          Stylist (Optional)
          <select
            name="stylist"
            value={selectedStylistId}
            onChange={(e) => setSelectedStylistId(e.target.value)}
            className={field}
          >
            <option value="">Any Available Stylist</option>
            {convexStylists.map((st: any) => (
              <option key={st._id} value={st._id}>
                {st.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="text-sm font-medium text-plum">
        Date
        <input
          type="date"
          name="date"
          required
          suppressHydrationWarning
          min={new Date().toISOString().slice(0, 10)}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={field}
        />
      </label>

      {sunday && (
        <p className="text-sm text-gold-deep bg-blush p-2.5 rounded-lg border border-gold/40">
          Sundays are bookings only. The owner will review and confirm your slot.
        </p>
      )}

      <fieldset>
        <legend className="text-sm font-medium text-plum">
          Time Slot {availabilityData?.duration ? `(${availabilityData.duration} mins)` : ""}
        </legend>
        {availabilityData?.closed ? (
          <p className="mt-2 text-sm text-rose">
            {availabilityData.reason || "The salon is closed on this date."}
          </p>
        ) : (
          <div className="mt-1 grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {availableSlots.map(({ time: t, available }) => (
              <button
                key={t}
                type="button"
                disabled={!available}
                aria-pressed={time === t}
                onClick={() => {
                  if (available) {
                    setTime(t);
                    setErr("");
                  }
                }}
                className={`min-h-[44px] rounded-xl border py-2.5 text-sm font-medium transition ${
                  !available
                    ? "cursor-not-allowed border-line bg-gray-100 text-gray-400 line-through"
                    : time === t
                    ? "border-plum bg-plum text-blush shadow-sm"
                    : "border-gold/60 bg-white hover:border-plum"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </fieldset>

      <label className="text-sm font-medium text-plum">
        Your Name
        <input
          name="name"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={field}
          placeholder="e.g. Chioma or Dayo"
        />
      </label>

      <label className="text-sm font-medium text-plum">
        Phone Number
        <input
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={field}
          placeholder="0810 000 0000"
        />
      </label>

      <label className="text-sm font-medium text-plum">
        Email Address (for receipt & reminders)
        <input
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
          placeholder="you@example.com"
        />
      </label>

      <label className="text-sm font-medium text-plum">
        Special Notes / Style preferences
        <textarea
          name="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={field}
          placeholder="Let us know if you have style pictures, loc care notes, etc."
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className={`${btn} disabled:opacity-50`}
      >
        {loading ? "Processing..." : "Reserve Your Slot"}
      </button>

      <p role="status" className="min-h-5 text-sm text-plum/70">
        {err || "Your booking will be reserved and confirmed on WhatsApp."}
      </p>
    </form>
  );
}
