import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Utensils, ShoppingBag, MessageCircle, Phone, Truck, Star, PartyPopper, MapPin, Tag, CalendarCheck } from "lucide-react";
import api from "../lib/api";
import { BUSINESS, CURRENCY } from "../lib/constants";
import MenuCard from "../components/MenuCard";
import BookingSection from "../components/BookingSection";

export default function Home() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  const [offers, setOffers] = useState([]);
  const [offerIdx, setOfferIdx] = useState(0);

  useEffect(() => {
    api.get("/menu").then((r) => setMenu(r.data)).catch(() => {});
    api.get("/reviews").then((r) => setReviews(r.data)).catch(() => {});
    api.get("/settings").then((r) => setSettings(r.data)).catch(() => {});
    api.get("/offers").then((r) => setOffers(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (offers.length <= 1) return;
    const t = setInterval(() => setOfferIdx((i) => (i + 1) % offers.length), 4000);
    return () => clearInterval(t);
  }, [offers.length]);

  const bestSellers = menu.filter((m) => m.is_bestseller).slice(0, 3);
  const specials = menu.filter((m) => m.is_todays_special).slice(0, 3);
  const menuUrl = `${window.location.origin}/menu`;
  const scrollToBooking = () => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div>
      {/* HERO */}
      <section className="relative min-h-[88vh] flex items-center">
        <img src={BUSINESS.hero} alt="restaurant" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-bg" />
        <div className="relative max-w-7xl mx-auto px-5 py-20 w-full">
          <div className="max-w-2xl">
            <img src={BUSINESS.logo} alt="logo" className="h-24 w-24 rounded-full bg-white object-cover ring-2 ring-primary/50 mb-6" />
            <div className="overline text-primary mb-4">Silchar's Premium Cafeteria</div>
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
              {BUSINESS.name}
            </h1>
            <p className="text-2xl md:text-3xl font-display text-primary mt-3">
              {BUSINESS.tagline}
            </p>
            <p className="text-white/80 mt-4 flex items-center gap-2">
              <MapPin size={16} className="text-primary" /> {BUSINESS.address}
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <button data-testid="hero-view-menu-btn" onClick={() => navigate("/menu")} className="bg-primary hover:bg-primaryHover text-black font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-colors hover:-translate-y-0.5 duration-200">
                <Utensils size={18} /> View Menu
              </button>
              <button data-testid="hero-order-now-btn" onClick={() => navigate("/menu")} className="bg-white text-black font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-colors hover:-translate-y-0.5 duration-200">
                <ShoppingBag size={18} /> Order Now
              </button>
              <a data-testid="hero-whatsapp-btn" href={`https://wa.me/${BUSINESS.whatsappIntl}`} target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-500 text-white font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-colors hover:-translate-y-0.5 duration-200">
                <MessageCircle size={18} /> WhatsApp
              </a>
              <a data-testid="hero-call-btn" href={`tel:${BUSINESS.phone}`} className="border border-white/25 hover:border-primary hover:text-primary font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-colors">
                <Phone size={18} /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* DELIVERY BANNER */}
      <section className="max-w-7xl mx-auto px-5 -mt-8 relative z-10">
        <div className="bg-primary text-black rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 shadow-2xl shadow-primary/20">
          <Truck size={40} className="shrink-0" />
          <div className="flex-1 text-center md:text-left">
            <div className="font-display text-xl md:text-2xl font-bold">Home Delivery Available</div>
            <p className="text-black/80 text-sm md:text-base">
              Delivery charges apply{settings ? ` (${CURRENCY}${settings.delivery_charge}, free above ${CURRENCY}${settings.free_delivery_above})` : ""}. Packaging charges may apply.
            </p>
          </div>
          <button data-testid="banner-order-btn" onClick={() => navigate("/menu")} className="bg-black text-white font-bold px-6 py-3 rounded-full whitespace-nowrap hover:bg-neutral-800 transition-colors">
            Order Now
          </button>
        </div>
      </section>

      {/* ROTATING OFFERS BANNER */}
      {offers.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 mt-6">
          <div data-testid="offer-banner" className="relative overflow-hidden bg-surface border border-primary/30 rounded-xl p-4 flex items-center gap-3 min-h-[60px]">
            <Tag className="text-primary shrink-0" size={22} />
            <div className="relative flex-1 h-6 overflow-hidden">
              {offers.map((o, i) => (
                <p
                  key={o.id}
                  data-testid={`offer-slide-${i}`}
                  className="absolute inset-0 text-sm md:text-base font-semibold transition-all duration-500"
                  style={{ opacity: i === offerIdx ? 1 : 0, transform: i === offerIdx ? "translateY(0)" : "translateY(8px)" }}
                >
                  {o.text}
                </p>
              ))}
            </div>
            {offers.length > 1 && (
              <div className="flex gap-1.5 shrink-0">
                {offers.map((_, i) => (
                  <button
                    key={i}
                    data-testid={`offer-dot-${i}`}
                    onClick={() => setOfferIdx(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === offerIdx ? "bg-primary" : "bg-white/25"}`}
                    aria-label={`Offer ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TODAY'S SPECIAL */}
      {specials.length > 0 && (
        <Section title="Today's Special" overline="Chef's Picks" testid="todays-special-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specials.map((m) => <MenuCard key={m.id} item={m} />)}
          </div>
        </Section>
      )}

      {/* BEST SELLERS */}
      {bestSellers.length > 0 && (
        <Section title="Best Sellers" overline="Loved by Customers" testid="bestsellers-section">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map((m) => <MenuCard key={m.id} item={m} />)}
          </div>
        </Section>
      )}

      {/* PARTY BOOKING */}
      <section data-testid="party-section" className="max-w-7xl mx-auto px-5 mt-24">
        <div className="relative rounded-3xl overflow-hidden border border-white/10">
          <img src={BUSINESS.party} alt="party" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/70 to-black/40" />
          <div className="relative p-8 md:p-16 max-w-2xl">
            <div className="flex items-center gap-2 text-primary overline mb-4">
              <PartyPopper size={18} /> Celebrate With Us
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-tight">Birthday Parties & Family Functions</h2>
            <p className="text-white/80 mt-4 text-lg">
              {settings?.party_note || "We organize Birthday Parties & Family Functions. Call us to reserve your date!"}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <a data-testid="party-whatsapp-btn" href={`https://wa.me/${BUSINESS.whatsappIntl}?text=${encodeURIComponent("Hi! I'd like to book a party/function at The Cafeteria.")}`} target="_blank" rel="noreferrer" className="bg-green-600 hover:bg-green-500 text-white font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-colors">
                <MessageCircle size={18} /> Book via WhatsApp
              </a>
              <a data-testid="party-call-btn" href={`tel:${BUSINESS.phone}`} className="bg-primary hover:bg-primaryHover text-black font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-colors">
                <Phone size={18} /> Call to Book
              </a>
              <button data-testid="party-book-now-btn" onClick={scrollToBooking} className="bg-white text-black font-bold px-7 py-3.5 rounded-full flex items-center gap-2 transition-colors hover:-translate-y-0.5 duration-200">
                <CalendarCheck size={18} /> Book Online
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TABLE & PARTY BOOKING */}
      <BookingSection />

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <Section title="What Our Guests Say" overline="Reviews" testid="reviews-section">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((r) => (
              <div key={r.id} className="bg-surface border border-white/10 rounded-2xl p-6">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < r.rating ? "text-primary fill-primary" : "text-white/20"} />
                  ))}
                </div>
                <p className="text-white/85">&ldquo;{r.comment}&rdquo;</p>
                <div className="mt-4 font-display text-primary">— {r.name}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* CONTACT + QR */}
      <section id="contact" data-testid="contact-section" className="max-w-7xl mx-auto px-5 mt-24">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-surface border border-white/10 rounded-2xl p-8">
            <div className="overline text-primary mb-4">Visit / Contact</div>
            <h3 className="font-display text-3xl mb-6">Get In Touch</h3>
            <div className="space-y-4">
              <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-3 hover:text-primary transition-colors"><Phone size={18} className="text-primary" /> {BUSINESS.phone}</a>
              <a href={`https://wa.me/${BUSINESS.whatsappIntl}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-primary transition-colors"><MessageCircle size={18} className="text-primary" /> {BUSINESS.whatsapp} (WhatsApp)</a>
              <div className="flex items-start gap-3 text-white/80"><MapPin size={18} className="text-primary mt-0.5" /> {BUSINESS.address}</div>
            </div>
          </div>
          <div className="bg-surface border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <div className="overline text-primary mb-4">Scan for Menu</div>
            <div className="bg-white p-4 rounded-2xl" data-testid="menu-qr-code">
              <QRCodeCanvas value={menuUrl} size={160} fgColor="#0A0A0A" bgColor="#ffffff" />
            </div>
            <p className="text-muted text-sm mt-4">Scan to view our digital menu on your phone</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, overline, testid, children }) {
  return (
    <section data-testid={testid} className="max-w-7xl mx-auto px-5 mt-24">
      <div className="overline text-primary mb-2">{overline}</div>
      <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
