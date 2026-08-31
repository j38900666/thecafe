import { motion } from "framer-motion";
import { PartyPopper, MessageCircle, Phone } from "lucide-react";
import { IMG, WHATSAPP_URL, PHONE_TEL } from "@/constants";

export default function PartySection() {
  return (
    <section id="parties" data-testid="party-section" className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-28">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.8 }}
                    className="relative overflow-hidden rounded-t-[9rem] rounded-b-3xl border border-caf-line shadow-xl">
          <img src={IMG.table} alt="Party spreads at The Cafeteria" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-caf-ink/45 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 rounded-full bg-caf-bg/90 px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-caf-brand backdrop-blur">
            Advance bookings open
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.7 }}>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-caf-brand">
            <PartyPopper className="h-4 w-4" /> Celebrations
          </div>
          <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Party bookings & <span className="italic text-caf-brand">special celebrations</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-caf-ink/65">
            Birthdays, farewells, small gatherings — we organise parties and special celebrations right here at the camp.
            Share your requirements and leave the food to us.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello The Cafeteria, I would like to book a party.")}`}
               target="_blank" rel="noreferrer" data-testid="party-whatsapp-btn"
               className="inline-flex items-center gap-2 rounded-full bg-caf-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-caf-ink">
              <MessageCircle className="h-4 w-4" /> Book on WhatsApp
            </a>
            <a href={PHONE_TEL} data-testid="party-call-btn"
               className="inline-flex items-center gap-2 rounded-full border border-caf-ink/20 px-7 py-3.5 text-sm font-semibold transition-colors duration-300 hover:border-caf-brand hover:text-caf-brand">
              <Phone className="h-4 w-4" /> Call +91 87218 24729
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
