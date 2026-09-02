import React, { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import api from "../lib/api";
import MenuCard from "../components/MenuCard";

export default function Menu() {
  const [categories, setCategories] = useState([]);
  const [menu, setMenu] = useState([]);
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(["All", ...r.data])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (active !== "All") params.category = active;
    if (search) params.search = search;
    api.get("/menu", { params })
      .then((r) => { setMenu(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [active, search]);

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="overline text-primary mb-2">Digital Menu</div>
      <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Explore Our Dishes</h1>

      {/* Search */}
      <div className="mt-8 relative max-w-lg">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
        <input
          data-testid="menu-search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes..."
          className="w-full bg-surface border border-white/10 rounded-full pl-11 pr-10 py-3 focus:border-primary outline-none transition-colors"
        />
        {search && (
          <button data-testid="menu-search-clear" onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {categories.map((c) => (
          <button
            key={c}
            data-testid={`category-pill-${c.toLowerCase().replace(/[^a-z]/g, "-")}`}
            onClick={() => setActive(c)}
            className={`whitespace-nowrap px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
              active === c ? "bg-primary text-black" : "bg-elevated text-white/70 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl h-80 animate-pulse border border-white/5" />
            ))}
          </div>
        ) : menu.length === 0 ? (
          <div data-testid="menu-empty" className="text-center py-24 text-muted">No dishes found. Try a different search.</div>
        ) : (
          <div data-testid="menu-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((m) => (
              <MenuCard key={m.id} item={m} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
