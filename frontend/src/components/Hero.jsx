import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, Bike, Phone } from "lucide-react";
import { IMG, LOGO_URL, WHATSAPP_URL } from "@/constants";

const lineWrap = {
  hidden: {},
  show: (i) => ({ transition: { staggerChildren: 0.14, delayChildren: 0.25 + i * 0.15 } }),
};
const lineUp = {
  hidden: { y: "115%" },
  show: { y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
};

export default function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  return (
    <section ref={ref} data-testid="hero-section" className="relative overflow-hidden pt-[72px]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pb-16 pt-10 sm:px-8 md:pt-16 lg:grid-cols-12 lg:gap-8 lg:pb-28">
        <motion.div style={{ y: textY }} className="relative z-10 flex flex-col justify-center lg:col-span-7">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }}
                      className="mb-6 flex items-center gap-3">
            <img src={LOGO_URL} alt="The Cafeteria" className="h-14 w-14 rounded-full object-cover shadow-md ring-1 ring-caf-line" />
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-caf-brand">GC CRPF Doyapur • Silchar</span>
          </motion.div>

          <h1 className="font-serif text-[15vw] font-medium leading-[0.92] tracking-tight sm:text-7xl lg:text-[6.5rem]">
            <motion.span variants={lineWrap} custom={0} initial="hidden" animate="show" className="block overflow-hidden pb-1">
              <motion.span variants={lineUp} className="block">Good Food.</motion.span>
            </motion.span>
            <motion.span variants={lineWrap} custom={1} initial="hidden" animate="show" className="block overflow-hidden pb-2">
              <motion.span variants={lineUp} className="block italic text-caf-brand">Good Mood.</motion.span>
            </motion.span>
          </h1>

          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 0.6 }}
                    className="mt-6 max-w-md text-base leading-relaxed text-caf-ink/70">
            The Cafeteria — <span className="font-medium text-caf-ink">Good Food • Good Mood</span>. Fresh, tasty food and
            refreshing drinks, made for a good meal and a good mood. Browse the menu and order in a tap.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}
                      className="mt-8 flex flex-wrap items-center gap-3">
            <a href="#menu" data-testid="hero-view-menu-btn"
               className="group inline-flex items-center gap-2 rounded-full bg-caf-brand px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-300 hover:bg-caf-ink">
              View Full Menu
              <ArrowDown className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>
            <a href={`${WHATSAPP_URL}?text=${encodeURIComponent("Hello The Cafeteria, I would like to place an order.")}`}
               target="_blank" rel="noreferrer" data-testid="hero-whatsapp-btn"
               className="inline-flex items-center gap-2 rounded-full border border-caf-ink/20 px-7 py-3.5 text-sm font-semibold transition-colors duration-300 hover:border-caf-brand hover:text-caf-brand">
              <Phone className="h-4 w-4" /> Order on WhatsApp
            </a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }}
                      className="mt-8 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-caf-olive">
            <Bike className="h-4 w-4" /> Home delivery available — charges apply
          </motion.div>
        </motion.div>

        <div className="relative lg:col-span-5">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className="relative overflow-hidden rounded-t-[10rem] rounded-b-[2rem] border border-caf-line shadow-2xl">
            <motion.img src={IMG.hero} alt="Chicken biryani at The Cafeteria" style={{ y: imgY }}
                        className="aspect-[4/5] w-full scale-110 object-cover" data-testid="hero-image" />
            <div className="absolute inset-0 bg-gradient-to-t from-caf-ink/40 via-transparent to-transparent" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.7 }}
                      className="absolute -bottom-6 left-4 rounded-2xl border border-white/40 bg-white/70 px-5 py-4 shadow-xl backdrop-blur-xl sm:left-8">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-caf-brand">Today at The Cafeteria</div>
            <div className="font-serif text-xl">Momos, rolls, biryani & shakes</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
