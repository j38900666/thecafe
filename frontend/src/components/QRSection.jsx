import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { QrCode, Smartphone, Printer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function QRSection() {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
  return (
    <section id="qr" data-testid="qr-section" className="border-t border-caf-line bg-caf-cream py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7 }}>
          <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-caf-brand">
            <QrCode className="h-4 w-4" /> Digital Menu
          </div>
          <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Scan. Browse. <span className="italic text-caf-brand">Order.</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-caf-ink/65">
            Point your phone camera at the code to open our live digital menu. It works on both Android and iPhone — no app
            needed. Perfect for table tents and counter cards.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-caf-ink/15 bg-white px-5 py-2.5 text-sm text-caf-ink/70">
            <Smartphone className="h-4 w-4 text-caf-brand" />
            <span className="max-w-[240px] truncate" data-testid="qr-site-url">{siteUrl}</span>
          </div>
          <div className="mt-4">
            <Link to="/poster" data-testid="qr-poster-btn"
                  className="inline-flex items-center gap-2 rounded-full bg-caf-ink px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 hover:bg-caf-brand">
              <Printer className="h-4 w-4" /> Print Table Poster
            </Link>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, rotate: -2, scale: 0.96 }} whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
                    viewport={{ once: true }} transition={{ duration: 0.8 }} className="flex justify-center lg:justify-end">
          <div className="rounded-3xl border-4 border-caf-ink bg-white p-8 shadow-[12px_12px_0_0_#1A1816]" data-testid="qr-code-card">
            <QRCodeCanvas value={siteUrl || "https://the-cafeteria-site.preview.emergentagent.com"} size={220}
                          bgColor="#FFFFFF" fgColor="#1A1816" level="M" includeMargin={false} data-testid="qr-code-canvas" />
            <div className="mt-4 text-center font-serif text-lg italic text-caf-ink/70">The Cafeteria — Good Food • Good Mood</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
