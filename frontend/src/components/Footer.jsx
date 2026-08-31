import { Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle, Bike, PartyPopper } from "lucide-react";
import { LOGO_URL, WHATSAPP_URL, PHONE_TEL } from "@/constants";

export default function Footer() {
  return (
    <footer id="contact" data-testid="footer" className="bg-caf-ink text-caf-bg">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-16 sm:px-8 md:grid-cols-3 lg:py-20">
        <div>
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="The Cafeteria logo" className="h-14 w-14 rounded-full object-cover ring-1 ring-caf-bg/20" />
            <div>
              <div className="font-serif text-2xl font-semibold tracking-tight">The Cafeteria</div>
              <div className="text-xs uppercase tracking-[0.22em] text-caf-amber">Good Food • Good Mood</div>
            </div>
          </div>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-caf-bg/60">
            Fresh, tasty food and refreshing drinks — made for a good meal and a good mood.
          </p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-caf-bg/50">Find us</div>
          <p className="flex items-start gap-3 text-caf-bg/80" data-testid="footer-address">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-caf-amber" /> GC CRPF Doyapur, Silchar, Assam
          </p>
          <a href={PHONE_TEL} data-testid="footer-phone" className="flex items-center gap-3 text-caf-bg/80 transition-colors duration-300 hover:text-caf-amber">
            <Phone className="h-4 w-4 shrink-0 text-caf-amber" /> Contact: +91 87218 24729
          </a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" data-testid="footer-whatsapp"
             className="flex items-center gap-3 text-caf-bg/80 transition-colors duration-300 hover:text-caf-amber">
            <MessageCircle className="h-4 w-4 shrink-0 text-caf-amber" /> WhatsApp orders: +91 91013 28562
          </a>
        </div>

        <div className="space-y-4 text-sm">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-caf-bg/50">Good to know</div>
          <p className="flex items-start gap-3 text-caf-bg/80">
            <Bike className="mt-0.5 h-4 w-4 shrink-0 text-caf-amber" /> Home delivery available — delivery charges apply (campus &amp; within 1 km)
          </p>
          <p className="flex items-start gap-3 text-caf-bg/80">
            <PartyPopper className="mt-0.5 h-4 w-4 shrink-0 text-caf-amber" /> We also organise parties &amp; special celebrations
          </p>
          <Link to="/admin" data-testid="footer-admin-link"
                className="inline-block rounded-full border border-caf-bg/20 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-caf-bg/70 transition-colors duration-300 hover:border-caf-amber hover:text-caf-amber">
            Admin Login
          </Link>
        </div>
      </div>
      <div className="border-t border-caf-bg/10 py-6 text-center text-xs text-caf-bg/40">
        © {new Date().getFullYear()} The Cafeteria — Good Food • Good Mood
      </div>
    </footer>
  );
}
