import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Printer, ArrowLeft, Bike, MessageCircle, Phone } from "lucide-react";
import { LOGO_URL } from "@/constants";

export default function Poster() {
  const siteUrl = window.location.origin;

  return (
    <div className="flex min-h-screen flex-col items-center bg-caf-cream px-4 py-10" data-testid="poster-page">
      <div className="no-print mb-8 flex gap-3">
        <Link to="/" data-testid="poster-back-btn"
              className="inline-flex items-center gap-2 rounded-full border border-caf-ink/20 px-6 py-3 text-sm font-semibold transition-colors duration-300 hover:border-caf-brand hover:text-caf-brand">
          <ArrowLeft className="h-4 w-4" /> Back to Site
        </Link>
        <button onClick={() => window.print()} data-testid="poster-print-btn"
                className="inline-flex items-center gap-2 rounded-full bg-caf-brand px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-caf-ink">
          <Printer className="h-4 w-4" /> Print / Save as PDF
        </button>
      </div>

      <div data-testid="poster-card"
           className="poster-card w-full max-w-[400px] border-4 border-caf-ink bg-caf-bg p-8 text-center shadow-[12px_12px_0_0_#1A1816]">
        <img src={LOGO_URL} alt="The Cafeteria logo" className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-caf-line" />
        <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight text-caf-ink">The Cafeteria</h1>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-caf-brand">Good Food • Good Mood</p>

        <div className="my-5 border-t-2 border-dashed border-caf-line" />

        <p className="font-serif text-2xl italic text-caf-ink">Scan to view the menu</p>
        <p className="mb-5 font-serif text-2xl italic text-caf-ink">&amp; order your food</p>

        <div className="mx-auto w-fit rounded-2xl border-2 border-caf-ink bg-white p-4">
          <QRCodeCanvas value={siteUrl} size={200} bgColor="#FFFFFF" fgColor="#1A1816" level="M" data-testid="poster-qr" />
        </div>
        <p className="mt-3 break-all text-[10px] text-caf-ink/50">{siteUrl}</p>

        <div className="my-5 border-t-2 border-dashed border-caf-line" />

        <div className="space-y-2 text-xs text-caf-ink/70">
          <p className="flex items-center justify-center gap-2">
            <Bike className="h-3.5 w-3.5 text-caf-brand" /> Home delivery available — charges apply
          </p>
          <p className="flex items-center justify-center gap-2">
            <MessageCircle className="h-3.5 w-3.5 text-caf-brand" /> WhatsApp orders: +91 91013 28562
          </p>
          <p className="flex items-center justify-center gap-2">
            <Phone className="h-3.5 w-3.5 text-caf-brand" /> Call: +91 87218 24729
          </p>
          <p className="pt-1 text-[10px] uppercase tracking-[0.18em] text-caf-ink/45">GC CRPF Doyapur, Silchar</p>
        </div>
      </div>
      <p className="no-print mt-6 max-w-sm text-center text-xs text-caf-ink/50">
        Print this card and place it on cafeteria tables or the counter — customers scan it with any Android or iPhone camera.
      </p>
    </div>
  );
}
