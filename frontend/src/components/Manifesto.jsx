import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { IMG } from "@/constants";

const CHAPTERS = [
  {
    no: "01",
    title: "Fresh, made to order",
    body: "Every plate leaves the kitchen hot — from steamed momos and crispy rolls to slow-cooked chicken kosha. Nothing sits around waiting.",
    img: IMG.momos,
  },
  {
    no: "02",
    title: "A menu for every mood",
    body: "Chai at dawn, cold coffee at noon, biryani at night. Nine categories, over a hundred items, and prices that stay friendly.",
    img: IMG.shake,
  },
  {
    no: "03",
    title: "To your door, in the camp",
    body: "Home delivery is available across the campus and within 1 km of GC CRPF Doyapur on a chargeable basis. We confirm the charge before we ride.",
    img: IMG.vibe,
  },
];

export default function Manifesto() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section id="story" ref={ref} data-testid="manifesto-section" className="mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:py-32">
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7 }} className="mb-14 max-w-2xl">
        <div className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-caf-brand">Our Story</div>
        <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          A small cafeteria with a <span className="italic text-caf-brand">big heart</span> inside the camp.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-3 lg:gap-10">
        {CHAPTERS.map((c, i) => (
          <motion.article key={c.no} initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.7, delay: i * 0.12 }}
                          className="group" data-testid={`chapter-${c.no}`}>
            <div className="relative mb-6 overflow-hidden rounded-t-[7rem] rounded-b-3xl border border-caf-line">
              <motion.img src={c.img} alt={c.title} style={{ y }} loading="lazy"
                          className="aspect-[4/5] w-full scale-110 object-cover transition-transform duration-700 group-hover:scale-[1.16]" />
              <span className="absolute left-5 top-8 rounded-full bg-caf-bg/85 px-4 py-1.5 font-serif text-lg italic text-caf-brand backdrop-blur">
                {c.no}
              </span>
            </div>
            <h3 className="mb-2 font-serif text-2xl tracking-tight sm:text-3xl">{c.title}</h3>
            <p className="text-sm leading-relaxed text-caf-ink/65">{c.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
