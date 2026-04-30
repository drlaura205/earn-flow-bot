import { useEffect, useState } from "react";

const SLIDES = [
  {
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    title: "Our Modern HQ",
    subtitle: "Building the future of AI earnings",
  },
  {
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    title: "Our Team",
    subtitle: "Dedicated professionals worldwide",
  },
  {
    url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    title: "Trusted Globally",
    subtitle: "200,000+ active members",
  },
  {
    url: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
    title: "AI-Powered Platform",
    subtitle: "Smart automation for steady returns",
  },
];

export function CompanySlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-2xl shadow-elevated">
      {SLIDES.map((s, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ${idx === i ? "opacity-100" : "opacity-0"}`}
        >
          <img src={s.url} alt={s.title} className="h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-base font-black drop-shadow">{s.title}</p>
            <p className="text-xs text-white/85">{s.subtitle}</p>
          </div>
        </div>
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
