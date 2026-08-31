import { motion } from "framer-motion";
import { Bike, MessageCircle } from "lucide-react";
import { WHATSAPP_URL } from "@/constants";

export default function DeliveryBanner() {
  return (
    <section id="delivery" data-testid="delivery-section" className="bg-caf-ink py-20 text-caf-bg lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-8 lg:grid-cols-12">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7 }} className="lg:col-span-7">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-caf-bg/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-caf-amber">
            <Bike className="h-4 w-4" /> Home Delivery
          </div>
          <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
            Hungry? <span className="italic text-caf-amber">We deliver.</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-caf-bg/70">
            Home delivery is available on a <span className="font-semibold text-caf-bg">chargeable basis</span> across the
            campus and within 1 km of the GC CRPF Doyapur camp. Delivery &amp; packaging charges are confirmed manually when
            you place your order — no surprises.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.15 }} className="lg:col-span-5">
          <div className="rounded-3xl border border-caf-bg/15 bg-white/5 p-8 backdrop-blur">
            <div className="font-serif text-2xl">Order in two taps</div>
            <p className="mt-2 text-sm text-caf-bg/60">Fill your cart, tap order, and your food is on its way after a quick confirmation.</p>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello The Cafeteria, I would like to place an order.")}`}
               target="_blank" rel="noreferrer" data-testid="delivery-whatsapp-btn"
               className="mt-6 flex items-center justify-center gap-2 rounded-full bg-caf-amber py-4 text-sm font-semibold text-caf-ink transition-colors duration-300 hover:bg-caf-bg">
              <MessageCircle className="h-4 w-4" /> Order on WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
