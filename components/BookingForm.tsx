"use client";
import { useState } from "react";
import { SERVICES, SITE } from "@/lib/site";
import { btn, field } from "@/lib/ui";

const TIMES = ["09:30", "11:00", "12:30", "14:00", "15:30", "17:00"]; // placeholder until the booking backend exists

export default function BookingForm({ service }: { service?: string }) {
  const [time, setTime] = useState("");
  const [err, setErr] = useState("");
  const [sunday, setSunday] = useState(false);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!time) return setErr("Pick a time slot to continue.");
    const f = new FormData(e.currentTarget);
    const msg = `Hello Janey Radiance, I'd like to book ${f.get("service")} on ${f.get("date")} at ${time}. Name: ${f.get("name")}. Phone: ${f.get("phone")}.`;
    window.open(`${SITE.wa}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
  }

  return (
    <form onSubmit={submit} className="grid max-w-md gap-4">
      <label>Service
        <select name="service" defaultValue={service ?? SERVICES[0].name} className={field}>
          {SERVICES.map((s) => <option key={s.slug}>{s.name}</option>)}
        </select>
      </label>
      <label>Date
        <input type="date" name="date" required suppressHydrationWarning min={new Date().toISOString().slice(0, 10)}
          onChange={(e) => setSunday(!!e.target.value && new Date(e.target.value + "T12:00:00").getDay() === 0)} className={field} />
      </label>
      {sunday && <p className="text-sm text-gold-deep">Sundays are bookings only. We&apos;ll confirm your slot on WhatsApp.</p>}
      <fieldset>
        <legend>Time</legend>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {TIMES.map((t) => (
            <button key={t} type="button" aria-pressed={time === t} onClick={() => { setTime(t); setErr(""); }}
              className={`rounded-xl border py-3 ${time === t ? "border-plum bg-plum text-blush" : "border-gold/60 bg-white"}`}>{t}</button>
          ))}
        </div>
      </fieldset>
      <label>Your name<input name="name" required autoComplete="name" className={field} /></label>
      <label>Phone<input name="phone" type="tel" required autoComplete="tel" className={field} /></label>
      <button className={btn}>Confirm on WhatsApp</button>
      <p role="status" className="min-h-5 text-sm text-plum/70">{err || "Opens WhatsApp with your request filled in."}</p>
    </form>
  );
}
