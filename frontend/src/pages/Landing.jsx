import { useEffect, useRef } from "react";
import Lenis from "lenis";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import SpecialsSection from "@/components/SpecialsSection";
import Manifesto from "@/components/Manifesto";
import MenuSection from "@/components/MenuSection";
import DeliveryBanner from "@/components/DeliveryBanner";
import PartySection from "@/components/PartySection";
import QRSection from "@/components/QRSection";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";

export default function Landing() {
  const lenisRef = useRef(null);

  useEffect(() => {
    const lenis = new Lenis({ smoothWheel: true, anchors: { offset: -88 } });
    lenisRef.current = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return (
    <div data-testid="landing-page" className="min-h-screen bg-caf-bg text-caf-ink">
      <Navbar />
      <main id="top">
        <Hero />
        <Marquee />
        <SpecialsSection />
        <Manifesto />
        <MenuSection />
        <DeliveryBanner />
        <PartySection />
        <QRSection />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
