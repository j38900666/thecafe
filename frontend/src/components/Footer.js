import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { BUSINESS } from "../lib/constants";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-surface mt-24">
      <div className="max-w-7xl mx-auto px-5 py-14 grid md:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <img src={BUSINESS.logo} alt="logo" className="h-12 w-12 rounded-full bg-white object-cover" />
            <div>
              <div className="font-display text-xl">{BUSINESS.name}</div>
              <div className="overline text-primary text-[9px]">{BUSINESS.tagline}</div>
            </div>
          </div>
          <p className="text-muted text-sm mt-4 max-w-xs">
            Premium cafeteria serving fresh, delicious food with home delivery across Silchar.
          </p>
        </div>
        <div>
          <div className="overline text-primary mb-4">Reach Us</div>
          <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-3 text-sm mb-3 hover:text-primary transition-colors">
            <Phone size={16} /> {BUSINESS.phone}
          </a>
          <a href={`https://wa.me/${BUSINESS.whatsappIntl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm mb-3 hover:text-primary transition-colors">
            <MessageCircle size={16} /> {BUSINESS.whatsapp} (WhatsApp)
          </a>
          <div className="flex items-start gap-3 text-sm text-muted">
            <MapPin size={16} className="mt-0.5 shrink-0" /> {BUSINESS.address}
          </div>
        </div>
        <div>
          <div className="overline text-primary mb-4">Explore</div>
          <div className="flex flex-col gap-2 text-sm">
            <Link to="/menu" className="hover:text-primary transition-colors">Digital Menu</Link>
            <Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link>
            <Link to="/admin" className="hover:text-primary transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-muted">
        © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
      </div>
    </footer>
  );
}
