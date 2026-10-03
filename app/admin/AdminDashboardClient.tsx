"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { btn, btnSm, field, card } from "@/lib/ui";

export default function AdminDashboardClient() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [activeTab, setActiveTab] = useState<"bookings" | "services" | "hours" | "stylists" | "analytics">("bookings");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [blockedDateInput, setBlockedDateInput] = useState("");
  const [blockedNoteInput, setBlockedNoteInput] = useState("");
  const [newStylistName, setNewStylistName] = useState("");
  const [newStylistSpecialties, setNewStylistSpecialties] = useState("");

  // Check auth cookie on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/auth");
        if (res.ok) setAuthed(true);
        else setAuthed(false);
      } catch {
        setAuthed(false);
      }
    }
    checkAuth();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuthed(true);
      } else {
        setLoginErr(data.error || "Incorrect admin password");
      }
    } catch {
      setLoginErr("Login request failed");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuthed(false);
  }

  // Live Convex queries & mutations
  const bookings = useQuery(api.admin?.listAllBookings, {
    date: filterDate || undefined,
    status: filterStatus || undefined,
  });

  const services = useQuery(api.services?.listServices, { activeOnly: false });
  const stylists = useQuery(api.services?.listStylists, { activeOnly: false });
  const availability = useQuery(api.settings?.getHoursAndAvailability, {});
  const stats = useQuery(api.events?.getEventStats, {});

  const updateBookingStatus = useMutation(api.admin?.updateBookingStatus);
  const markPaid = useMutation(api.admin?.markPaid);
  const recordReminder = useMutation(api.admin?.recordReminderSent);
  const blockDateMutation = useMutation(api.settings?.blockDate);
  const unblockDateMutation = useMutation(api.settings?.unblockDate);
  const updateServiceMutation = useMutation(api.settings?.updateService);
  const addStylistMutation = useMutation(api.settings?.addStylist);
  const toggleStylistMutation = useMutation(api.settings?.toggleStylistActive);

  if (authed === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-plum">Loading dashboard...</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm px-5 py-20">
        <div className="rounded-3xl border border-gold/70 bg-white p-8 shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-plum">Owner Login</h1>
          <p className="mt-1 text-sm text-plum/70">Janey Radiance Salon &amp; Spa</p>
          <form onSubmit={handleLogin} className="mt-6 grid gap-4">
            <label className="text-sm font-medium">
              Admin Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={field}
                placeholder="Enter admin password"
              />
            </label>
            {loginErr && <p className="text-sm text-rose">{loginErr}</p>}
            <button type="submit" className={btn}>Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blush px-4 py-8 max-w-7xl mx-auto">
      {/* Mobile-friendly header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/40 pb-5">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold text-plum">Salon Owner Dashboard</h1>
          <p className="text-sm text-plum/75">Manage bookings, Sunday approvals, hours &amp; services</p>
        </div>
        <button onClick={handleLogout} className={btnSm}>
          Logout
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {(["bookings", "services", "hours", "stylists", "analytics"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`min-h-[44px] rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab ? "bg-plum text-blush" : "border border-gold bg-white text-plum"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab: Bookings */}
      {activeTab === "bookings" && (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
              placeholder="Filter by date"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending_approval">Pending Sunday Approval</option>
              <option value="pending_deposit">Pending Deposit</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
            {(filterDate || filterStatus) && (
              <button
                onClick={() => {
                  setFilterDate("");
                  setFilterStatus("");
                }}
                className="text-xs text-rose underline"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-4">
            {(!bookings || bookings.length === 0) ? (
              <div className={`${card} p-8 text-center text-plum/70`}>
                No bookings found matching current filters.
              </div>
            ) : (
              bookings.map((b: any) => {
                const waReminderMsg = `Hello ${b.customerName}, this is Janey Radiance reminding you of your booking (${b.reference}) for ${b.serviceName} on ${b.date} at ${b.startTime}. See you soon at 164 Herbert Macaulay Way, Yaba!`;
                const waReminderUrl = `https://wa.me/${b.customerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(waReminderMsg)}`;

                return (
                  <div key={b._id} className={`${card} p-5 flex flex-col md:flex-row md:items-center justify-between gap-4`}>
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-semibold text-rose">{b.reference}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                            b.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : b.status === "pending_approval"
                              ? "bg-amber-100 text-amber-800"
                              : b.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {b.status.replace("_", " ")}
                        </span>
                        {b.isSunday && (
                          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-medium text-gold-deep">
                            Sunday Request
                          </span>
                        )}
                        {b.depositPaid && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Deposit Paid (₦{b.depositAmount?.toLocaleString()})
                          </span>
                        )}
                      </div>
                      <h3 className="font-display text-xl font-semibold text-plum">{b.serviceName}</h3>
                      <p className="text-sm text-plum/85">
                        <strong>Date:</strong> {b.date} ({b.startTime} - {b.endTime})
                      </p>
                      <p className="text-sm text-plum/85">
                        <strong>Customer:</strong> {b.customerName} ({b.customerPhone})
                      </p>
                      {b.notes && <p className="text-xs italic text-plum/70">Note: {b.notes}</p>}
                      {b.utmSource && (
                        <p className="text-xs text-gold-deep">
                          Attribution: {b.utmSource} {b.utmCampaign ? `/ ${b.utmCampaign}` : ""}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
                      {b.status === "pending_approval" && (
                        <>
                          <button
                            onClick={() => updateBookingStatus?.({ bookingId: b._id, status: "confirmed" })}
                            className="min-h-[44px] rounded-lg bg-green-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-800"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateBookingStatus?.({ bookingId: b._id, status: "cancelled" })}
                            className="min-h-[44px] rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-800"
                          >
                            Decline
                          </button>
                        </>
                      )}

                      {!b.depositPaid && (
                        <button
                          onClick={() => markPaid?.({ bookingId: b._id })}
                          className="min-h-[44px] rounded-lg border border-gold bg-white px-3 py-1.5 text-xs font-medium text-plum hover:bg-gold/10"
                        >
                          Mark Paid
                        </button>
                      )}

                      <a
                        href={waReminderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordReminder?.({ bookingId: b._id })}
                        className="inline-flex min-h-[44px] items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                      >
                        {b.reminderSent ? "✓ Reminder Sent" : "Send WhatsApp Reminder"}
                      </a>

                      <button
                        onClick={() => updateBookingStatus?.({ bookingId: b._id, status: "completed" })}
                        className="min-h-[44px] rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-plum hover:bg-line"
                      >
                        Completed
                      </button>

                      <button
                        onClick={() => updateBookingStatus?.({ bookingId: b._id, status: "no_show" })}
                        className="min-h-[44px] rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-plum hover:bg-line"
                      >
                        No-Show
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab: Services & Pricing */}
      {activeTab === "services" && (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-plum/75">
            Configure service durations, prices, and whether a Paystack deposit is required.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {services?.map((s: any) => (
              <div key={s._id} className={`${card} p-5 space-y-3`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>
                    {s.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>Duration:</strong> {s.durationMinutes} minutes</p>
                  <p><strong>Price:</strong> {s.price ? `₦${s.price.toLocaleString()}` : "Contact for price"}</p>
                  <p><strong>Deposit Required:</strong> {s.depositRequired ? `Yes (₦${s.depositAmount?.toLocaleString() ?? 0})` : "No"}</p>
                  <p className="text-xs text-plum/70">{s.blurb}</p>
                </div>
                <button
                  onClick={() => {
                    const newDur = prompt("Enter duration in minutes:", s.durationMinutes.toString());
                    if (!newDur) return;
                    const reqDep = confirm("Require Paystack deposit for this service?");
                    let depAmt = s.depositAmount;
                    if (reqDep) {
                      const depInput = prompt("Enter deposit amount in Naira:", s.depositAmount?.toString() ?? "5000");
                      if (depInput) depAmt = Number(depInput);
                    }
                    updateServiceMutation?.({
                      serviceId: s._id,
                      name: s.name,
                      durationMinutes: Number(newDur),
                      price: s.price,
                      depositRequired: reqDep,
                      depositAmount: reqDep ? depAmt : undefined,
                      active: s.active,
                      blurb: s.blurb,
                    });
                  }}
                  className={`${btnSm} mt-2`}
                >
                  Edit Duration / Deposit
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Hours & Blocked Dates */}
      {activeTab === "hours" && (
        <div className="mt-6 space-y-6">
          <div className={`${card} p-6`}>
            <h2 className="font-display text-2xl font-semibold">Block a Date / Holiday</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <input
                type="date"
                value={blockedDateInput}
                onChange={(e) => setBlockedDateInput(e.target.value)}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Reason (e.g. Public Holiday)"
                value={blockedNoteInput}
                onChange={(e) => setBlockedNoteInput(e.target.value)}
                className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
              />
              <button
                onClick={() => {
                  if (blockedDateInput) {
                    blockDateMutation?.({ date: blockedDateInput, note: blockedNoteInput });
                    setBlockedDateInput("");
                    setBlockedNoteInput("");
                  }
                }}
                className={btnSm}
              >
                Block Date
              </button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-plum">Currently Blocked Dates</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {availability
                  ?.filter((a: any) => a.type === "blocked" || a.isClosed)
                  .map((a: any) => (
                    <div key={a._id} className="flex items-center gap-2 rounded-lg border border-rose bg-rose/10 px-3 py-1 text-sm text-plum">
                      <span>{a.date || `Day ${a.dayOfWeek}`} {a.note ? `(${a.note})` : ""}</span>
                      {a.date && (
                        <button
                          onClick={() => unblockDateMutation?.({ date: a.date })}
                          className="font-bold text-rose hover:text-plum"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Stylists */}
      {activeTab === "stylists" && (
        <div className="mt-6 space-y-6">
          <div className={`${card} p-6 max-w-lg`}>
            <h2 className="font-display text-2xl font-semibold">Add Stylist</h2>
            <div className="mt-4 grid gap-3">
              <input
                placeholder="Stylist Name"
                value={newStylistName}
                onChange={(e) => setNewStylistName(e.target.value)}
                className={field}
              />
              <input
                placeholder="Specialties (comma-separated, e.g. Braids, Locs)"
                value={newStylistSpecialties}
                onChange={(e) => setNewStylistSpecialties(e.target.value)}
                className={field}
              />
              <button
                onClick={() => {
                  if (newStylistName) {
                    addStylistMutation?.({
                      name: newStylistName,
                      specialties: newStylistSpecialties.split(",").map((s) => s.trim()),
                    });
                    setNewStylistName("");
                    setNewStylistSpecialties("");
                  }
                }}
                className={btn}
              >
                Add Stylist
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {stylists?.map((st: any) => (
              <div key={st._id} className={`${card} p-5 flex items-center justify-between`}>
                <div>
                  <h3 className="font-display text-xl font-semibold">{st.name}</h3>
                  <p className="text-xs text-plum/70">{st.specialties?.join(", ")}</p>
                </div>
                <button
                  onClick={() => toggleStylistMutation?.({ stylistId: st._id, active: !st.active })}
                  className={btnSm}
                >
                  {st.active ? "Set Inactive" : "Set Active"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Analytics & Attribution */}
      {activeTab === "analytics" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className={`${card} p-5 text-center`}>
              <p className="text-xs uppercase text-plum/70">Total Tracked Events</p>
              <p className="mt-2 font-display text-4xl font-semibold text-rose">{stats?.total ?? 0}</p>
            </div>
            <div className={`${card} p-5 text-center`}>
              <p className="text-xs uppercase text-plum/70">Calls Clicked</p>
              <p className="mt-2 font-display text-4xl font-semibold text-plum">{stats?.byType?.["click_call"] ?? 0}</p>
            </div>
            <div className={`${card} p-5 text-center`}>
              <p className="text-xs uppercase text-plum/70">WhatsApp Inquiries</p>
              <p className="mt-2 font-display text-4xl font-semibold text-plum">{stats?.byType?.["click_whatsapp"] ?? 0}</p>
            </div>
            <div className={`${card} p-5 text-center`}>
              <p className="text-xs uppercase text-plum/70">Bookings Initiated</p>
              <p className="mt-2 font-display text-4xl font-semibold text-gold-deep">{stats?.byType?.["submit_book"] ?? 0}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className={`${card} p-6`}>
              <h3 className="font-display text-2xl font-semibold">Traffic Sources</h3>
              <dl className="mt-4 divide-y divide-line text-sm">
                {Object.entries(stats?.bySource ?? {}).map(([src, count]) => (
                  <div key={src} className="flex justify-between py-2">
                    <dt className="capitalize">{src}</dt>
                    <dd className="font-semibold">{count as number}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className={`${card} p-6`}>
              <h3 className="font-display text-2xl font-semibold">Activity by Date</h3>
              <dl className="mt-4 divide-y divide-line text-sm">
                {Object.entries(stats?.byDate ?? {}).map(([d, count]) => (
                  <div key={d} className="flex justify-between py-2">
                    <dt>{d}</dt>
                    <dd className="font-semibold">{count as number}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
