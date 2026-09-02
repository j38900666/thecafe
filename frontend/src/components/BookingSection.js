import React, { useState } from "react";
import { toast } from "sonner";
import { CalendarCheck, MessageCircle, PartyPopper } from "lucide-react";
import api from "../lib/api";
import { BUSINESS } from "../lib/constants";

const TYPES = ["Table Reservation", "Birthday Party", "Anniversary Party", "Kitty Party", "Get Together"];

export default function BookingSection() {
  const [form, setForm] = useState({ name: "", mobile: "", booking_type: "Table Reservation", date: "", time: "", guests: 2, notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    if (!form.name.trim()) return "Please enter your name";
    if (!/^\d{10}$/.test(form.mobile.trim())) return "Enter a valid 10-digit mobile number";
    if (!form.date) return "Please choose a date";
    return null;
  };

  const submit = async (viaWhatsApp) => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setSubmitting(true);
    try {
      const res = await api.post("/bookings", { ...form, guests: parseInt(form.guests) || 1 });
      if (viaWhatsApp) {
        const msg = `*🎉 ${BUSINESS.name} — Booking Request*\nRef: ${res.data.booking_number}\n\nType: ${form.booking_type}\nName: ${form.name}\nMobile: ${form.mobile}\nDate: ${form.date}${form.time ? " " + form.time : ""}\nGuests: ${form.guests}${form.notes ? "\nNote: " + form.notes : ""}`;
        window.open(`https://wa.me/${BUSINESS.whatsappIntl}?text=${encodeURIComponent(msg)}`, "_blank");
      }
      toast.success(`Booking request ${res.data.booking_number} sent! We'll confirm shortly.`);
      setForm({ name: "", mobile: "", booking_type: "Table Reservation", date: "", time: "", guests: 2, notes: "" });
    } catch {
      toast.error("Could not submit booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="booking" data-testid="booking-section" className="max-w-7xl mx-auto px-5 mt-24">
      <div className="grid lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-surface border border-white/10 rounded-3xl p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-primary overline mb-4"><PartyPopper size={18} /> Advance Booking</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">Reserve a Table or Book Your Celebration</h2>
          <p className="text-white/80 mt-4 text-lg">
            Advance booking available for <span className="text-primary font-semibold">Birthday Parties, Anniversaries, Kitty Parties, Get-Togethers</span> and table reservations. Pick a date and we'll take care of the rest.
          </p>
          <ul className="mt-6 space-y-2 text-white/70">
            {TYPES.map((t) => (
              <li key={t} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary" /> {t}</li>
            ))}
          </ul>
        </div>

        <div className="bg-elevated border border-white/10 rounded-3xl p-6 md:p-8">
          <h3 className="font-display text-2xl mb-5">Booking Request</h3>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input data-testid="booking-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" className="bk-input" />
              <input data-testid="booking-mobile" value={form.mobile} onChange={(e) => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10-digit mobile" className="bk-input" inputMode="numeric" />
            </div>
            <select data-testid="booking-type" value={form.booking_type} onChange={(e) => set("booking_type", e.target.value)} className="bk-input">
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <div className="grid sm:grid-cols-3 gap-4">
              <input data-testid="booking-date" type="date" min={new Date().toISOString().split("T")[0]} value={form.date} onChange={(e) => set("date", e.target.value)} className="bk-input" />
              <input data-testid="booking-time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} className="bk-input" />
              <input data-testid="booking-guests" type="number" min="1" value={form.guests} onChange={(e) => set("guests", e.target.value)} placeholder="Guests" className="bk-input" />
            </div>
            <textarea data-testid="booking-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Any special requests (cake, decoration, menu...)" className="bk-input min-h-[80px]" />
            <div className="flex flex-col sm:flex-row gap-3">
              <button data-testid="booking-submit-btn" disabled={submitting} onClick={() => submit(false)} className="flex-1 bg-primary hover:bg-primaryHover disabled:opacity-60 text-black font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors">
                <CalendarCheck size={18} /> Request Booking
              </button>
              <button data-testid="booking-whatsapp-btn" disabled={submitting} onClick={() => submit(true)} className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-colors">
                <MessageCircle size={18} /> Book via WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`.bk-input{width:100%;background:#0A0A0A;border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:0.75rem 1rem;outline:none;transition:border-color .2s;color:#fff}.bk-input:focus{border-color:#F59E0B}`}</style>
    </section>
  );
}
