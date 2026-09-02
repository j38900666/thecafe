import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Menu as MenuIcon, X, Phone } from "lucide-react";
import { useCart } from "../context/CartContext";
import { BUSINESS } from "../lib/constants";

export default function Navbar() {
  const { count, setOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { label: "Home", to: "/" },
    { label: "Menu", to: "/menu" },
    { label: "Book Table", to: "/#booking" },
    { label: "My Orders", to: "/orders" },
    { label: "QR / Contact", to: "/#contact" },
  ];

  const go = (to) => {
    setMobileOpen(false);
    if (to.startsWith("/#")) {
      navigate("/");
      setTimeout(() => document.getElementById(to.slice(2))?.scrollIntoView({ behavior: "smooth" }), 150);
    } else navigate(to);
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <nav className="max-w-7xl mx-auto px-5 h-16 md:h-20 flex items-center justify-between">
        <button data-testid="logo-home-btn" onClick={() => go("/")} className="flex items-center gap-3">
          <img src={BUSINESS.logo} alt="logo" className="h-11 w-11 rounded-full object-cover ring-1 ring-primary/40 bg-white" />
          <div className="text-left leading-none">
            <div className="font-display text-lg md:text-xl">{BUSINESS.name}</div>
            <div className="overline text-primary text-[9px] mt-0.5">{BUSINESS.tagline}</div>
          </div>
        </button>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <button
              key={l.label}
              data-testid={`nav-${l.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
              onClick={() => go(l.to)}
              className={`text-sm font-semibold transition-colors hover:text-primary ${
                location.pathname === l.to ? "text-primary" : "text-white/80"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            data-testid="nav-call-btn"
            href={`tel:${BUSINESS.phone}`}
            className="hidden sm:flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-full border border-white/15 hover:border-primary hover:text-primary transition-colors"
          >
            <Phone size={15} /> Call
          </a>
          <button
            data-testid="cart-open-btn"
            onClick={() => setOpen(true)}
            className="relative bg-primary hover:bg-primaryHover text-black p-2.5 rounded-full transition-colors"
          >
            <ShoppingBag size={20} />
            {count > 0 && (
              <span data-testid="cart-count-badge" className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button data-testid="mobile-menu-toggle" onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2">
            {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-bg px-5 py-4 flex flex-col gap-1">
          {links.map((l) => (
            <button
              key={l.label}
              data-testid={`mobile-nav-${l.label.toLowerCase().replace(/[^a-z]/g, "-")}`}
              onClick={() => go(l.to)}
              className="text-left py-3 border-b border-white/5 font-semibold"
            >
              {l.label}
            </button>
          ))}
          <a href={`tel:${BUSINESS.phone}`} className="py-3 font-semibold text-primary flex items-center gap-2">
            <Phone size={16} /> Call {BUSINESS.phone}
          </a>
        </div>
      )}
    </header>
  );
}
