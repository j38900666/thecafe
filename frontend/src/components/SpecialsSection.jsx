import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { useCart } from "@/context/CartContext";
import { itemFallback, slug } from "@/constants";

export default function SpecialsSection() {
  const [specials, setSpecials] = useState([]);
  const { add } = useCart();

  useEffect(() => {
    api.get("/menu")
      .then((r) => {
        const all = r.data.categories.flatMap((c) => c.items.map((i) => ({ ...i, category: c.name })));
        setSpecials(all.filter((i) => i.special));
      })
      .catch(() => {});
  }, []);

  if (!specials.length) return null;

  return (
    <section id="specials" data-testid="specials-section" className="mx-auto max-w-7xl px-4 pt-16 sm:px-8 lg:pt-20">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.7 }} className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-caf-amber">
            <Star className="h-4 w-4" fill="currentColor" /> Handpicked by the kitchen
          </div>
          <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Today&apos;s <span className="italic text-caf-brand">Specials</span>
          </h2>
        </div>
        <p className="max-w-xs text-sm text-caf-ink/60">Fresh picks for today only — grab them before they&apos;re gone.</p>
      </motion.div>

      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4">
        {specials.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="group w-60 shrink-0 snap-start sm:w-72" data-testid={`special-card-${slug(item.name)}`}>
            <div className="relative overflow-hidden rounded-2xl border border-caf-line bg-white shadow-sm">
              <img src={item.image} alt={item.name} loading="lazy"
                   onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = itemFallback(item.category); }}
                   className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
              <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-caf-amber px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-caf-ink">
                <Star className="h-3 w-3" fill="currentColor" /> Today&apos;s Special
              </span>
              <button data-testid={`special-add-${slug(item.name)}`}
                      onClick={() => { add(item); toast.success(`${item.name} added to cart`); }}
                      className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-caf-ink/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-colors duration-300 hover:bg-caf-brand">
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
              <h4 className="font-serif text-xl leading-snug tracking-tight">{item.name}</h4>
              <span className="shrink-0 font-serif text-xl font-semibold text-caf-brand">₹{Number(item.price).toFixed(0)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
