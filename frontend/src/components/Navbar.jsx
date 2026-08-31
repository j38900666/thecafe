import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBasket, Menu as MenuIcon, X } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { LOGO_URL } from "@/constants";

const LINKS = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#story" },
  { label: "Delivery", href: "#delivery" },
  { label: "Parties", href: "#parties" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-caf-line/70 bg-caf-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-8">
        <a href="#top" data-testid="nav-logo" className="flex items-center gap-3">
          <img src={LOGO_URL} alt="The Cafeteria logo" className="h-11 w-11 rounded-full object-cover ring-1 ring-caf-line" />
          <div className="leading-tight">
            <div className="font-serif text-xl font-semibold tracking-tight">The Cafeteria</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-caf-brand">Good Food • Good Mood</div>
          </div>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" data-testid="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} data-testid={`nav-link-${l.label.toLowerCase().replace(" ", "-")}`}
               className="text-sm font-medium text-caf-ink/70 transition-colors duration-300 hover:text-caf-brand">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button data-testid="nav-cart-button" onClick={() => setOpen(true)}
                  className="relative flex items-center gap-2 rounded-full bg-caf-ink px-4 py-2 text-sm font-medium text-caf-bg transition-colors duration-300 hover:bg-caf-brand">
            <ShoppingBasket className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span data-testid="nav-cart-count" className="flex h-5 min-w-5 items-center justify-center rounded-full bg-caf-brand px-1 text-xs text-white">{count}</span>
          </button>
          <button data-testid="nav-mobile-toggle" onClick={() => setMobileOpen((v) => !v)}
                  className="rounded-full border border-caf-line p-2 lg:hidden" aria-label="Menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                      className="overflow-hidden border-t border-caf-line bg-caf-bg lg:hidden" data-testid="nav-mobile-menu">
            <div className="flex flex-col gap-1 px-6 py-4">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                   className="rounded-lg px-2 py-3 font-serif text-2xl text-caf-ink transition-colors duration-300 hover:text-caf-brand">
                  {l.label}
                </a>
              ))}
              <Link to="/admin" className="px-2 py-3 text-sm text-caf-ink/50" data-testid="nav-admin-link">Admin Login</Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
