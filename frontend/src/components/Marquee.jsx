const ITEMS = [
  "The Cafeteria",
  "Good Food • Good Mood",
  "Home Delivery Available",
  "GC CRPF Doyapur, Silchar",
  "Order on WhatsApp +91 9101328562",
  "Party Bookings Open",
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div data-testid="marquee-section" className="overflow-hidden border-y border-caf-line bg-caf-cream py-6">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center gap-10">
            {row.map((t, i) => (
              <span key={`${half}-${i}`} className="flex items-center gap-10">
                <span className={`font-serif text-3xl sm:text-5xl ${i % 2 ? "text-outline italic" : "text-caf-ink/80"}`}>{t}</span>
                <span className="h-2 w-2 rounded-full bg-caf-brand" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
