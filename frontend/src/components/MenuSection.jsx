import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Loader2, Search, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/api";
import { useCart } from "@/context/CartContext";
import { itemFallback, slug } from "@/constants";

const ItemCard = ({ item }) => {
  const { add } = useCart();
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.5 }}
                className="group" data-testid={`menu-item-${slug(item.name)}`}>
      <div className="relative overflow-hidden rounded-2xl border border-caf-line bg-white shadow-sm">
        <img src={item.image} alt={item.name} loading="lazy"
             onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = itemFallback(item.category); }}
             className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
        {item.special && (
          <span data-testid={`special-badge-${slug(item.name)}`}
                className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-caf-amber px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-caf-ink">
            <Star className="h-3 w-3" fill="currentColor" /> Today&apos;s Special
          </span>
        )}
        <button data-testid={`add-to-cart-${slug(item.name)}`}
                onClick={() => { add(item); toast.success(`${item.name} added to cart`); }}
                className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-caf-ink/90 px-4 py-2 text-xs font-semibold text-white backdrop-blur transition-colors duration-300 hover:bg-caf-brand">
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
        <h4 className="flex items-center gap-2 font-serif text-xl leading-snug tracking-tight">
          <span data-testid={`veg-badge-${slug(item.name)}`} title={item.veg ? "Veg" : "Non-Veg"}
                className={`inline-block h-3 w-3 shrink-0 rounded-sm border ${item.veg ? "border-green-700 bg-green-600" : "border-red-800 bg-red-700"}`} />
          {item.name}
        </h4>
        <span className="shrink-0 font-serif text-xl font-semibold text-caf-brand" data-testid={`price-${slug(item.name)}`}>
          ₹{Number(item.price).toFixed(0)}
        </span>
      </div>
    </motion.div>
  );
};

export default function MenuSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("");
  const [query, setQuery] = useState("");
  const [vegFilter, setVegFilter] = useState("all");

  const visibleCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return categories
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) =>
            (vegFilter === "all" || (vegFilter === "veg" ? i.veg : !i.veg)) &&
            (!q || i.name.toLowerCase().includes(q))
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [categories, query, vegFilter]);

  useEffect(() => {
    api.get("/menu")
      .then((r) => {
        setCategories(r.data.categories);
        if (r.data.categories[0]) setActive(slug(r.data.categories[0].name));
      })
      .catch(() => toast.error("Could not load the menu"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id.replace("cat-", ""))),
      { rootMargin: "-25% 0px -65% 0px" }
    );
    visibleCategories.forEach((c) => {
      const el = document.getElementById(`cat-${slug(c.name)}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [visibleCategories]);

  const slugs = useMemo(() => visibleCategories.map((c) => ({ name: c.name, slug: slug(c.name) })), [visibleCategories]);

  return (
    <section id="menu" data-testid="menu-section" className="border-t border-caf-line bg-white/50 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ duration: 0.7 }} className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-caf-brand">The Menu</div>
            <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">Eat well, <span className="italic text-caf-brand">feel good.</span></h2>
          </div>
          <p className="max-w-xs text-sm text-caf-ink/60">Tap a category to jump to your favourite food. Every dish carries its own photo and price.</p>
        </motion.div>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" data-testid="menu-search-bar">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-caf-ink/40" />
            <input data-testid="menu-search-input" value={query} onChange={(e) => setQuery(e.target.value)}
                   placeholder="Search momos, biryani, shakes…"
                   className="w-full rounded-full border border-caf-line bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition-colors duration-300 focus:border-caf-brand" />
          </div>
          <div className="flex gap-2">
            {[["all", "All"], ["veg", "Veg"], ["nonveg", "Non-Veg"]].map(([val, label]) => (
              <button key={val} data-testid={`filter-${val}`} onClick={() => setVegFilter(val)}
                      className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-300 ${
                        vegFilter === val ? "border-caf-ink bg-caf-ink text-white" : "border-caf-line text-caf-ink/70 hover:border-caf-brand hover:text-caf-brand"
                      }`}>
                {val !== "all" && (
                  <span className={`inline-block h-3 w-3 rounded-sm border ${val === "veg" ? "border-green-700 bg-green-600" : "border-red-800 bg-red-700"}`} />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24" data-testid="menu-loading">
            <Loader2 className="h-8 w-8 animate-spin text-caf-brand" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <aside className="md:col-span-3">
              <div className="no-scrollbar sticky top-24 z-30 -mx-4 flex gap-2 overflow-x-auto bg-caf-bg/85 px-4 py-3 backdrop-blur-xl md:mx-0 md:flex-col md:bg-transparent md:p-0 md:backdrop-blur-0"
                   data-testid="category-nav">
                {slugs.map((c, i) => (
                  <a key={c.slug} href={`#cat-${c.slug}`} data-testid={`category-nav-${c.slug}`}
                     className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-300 md:rounded-xl md:border-transparent md:px-4 md:py-3 md:font-serif md:text-xl ${
                       active === c.slug
                         ? "border-caf-brand bg-caf-brand text-white md:bg-caf-cream md:text-caf-brand"
                         : "border-caf-line text-caf-ink/70 hover:border-caf-brand hover:text-caf-brand"
                     }`}>
                    <span className="mr-2 hidden text-xs italic text-caf-brand/70 md:inline">{String(i + 1).padStart(2, "0")}</span>
                    {c.name}
                  </a>
                ))}
              </div>
            </aside>

            <div className="md:col-span-9">
              {!visibleCategories.length && (
                <div className="rounded-3xl border border-dashed border-caf-line py-20 text-center" data-testid="menu-no-results">
                  <p className="font-serif text-2xl text-caf-ink/60">No dishes found.</p>
                  <p className="mt-2 text-sm text-caf-ink/50">Try a different search or clear the filter.</p>
                </div>
              )}
              {visibleCategories.map((cat, ci) => (
                <div key={cat.name} id={`cat-${slug(cat.name)}`} className="mb-16 scroll-mt-28" data-testid={`category-section-${slug(cat.name)}`}>
                  <div className="mb-8 flex items-baseline gap-4 border-b border-caf-line pb-4">
                    <span className="font-serif text-lg italic text-caf-brand">{String(ci + 1).padStart(2, "0")}</span>
                    <h3 className="font-serif text-3xl tracking-tight sm:text-4xl">{cat.name}</h3>
                    <span className="ml-auto text-xs uppercase tracking-[0.18em] text-caf-ink/40">{cat.items.length} items</span>
                  </div>
                  <div className="grid grid-cols-2 gap-5 sm:gap-7 lg:grid-cols-3">
                    {cat.items.map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
