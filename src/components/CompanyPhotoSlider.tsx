import { useEffect, useState } from "react";

// Group/event photo sets - each "slide" is a 3x2 grid of 6 photos
const PHOTO_SETS: string[][] = [
  [
    "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=400&q=70",
  ],
  [
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=400&q=70",
  ],
  [
    "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1559223694-98ed5e272fef?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=400&q=70",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=70",
  ],
];

export function CompanyPhotoSlider() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % PHOTO_SETS.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {PHOTO_SETS.map((set, idx) => (
        <div
          key={idx}
          className={`grid grid-cols-3 gap-0.5 transition-opacity duration-700 ${
            idx === i ? "opacity-100 relative" : "opacity-0 absolute inset-0"
          }`}
        >
          {set.map((src, j) => (
            <div key={j} className="aspect-square overflow-hidden bg-slate-200">
              <img src={src} alt="Company event" className="h-full w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      ))}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
        {PHOTO_SETS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Photo set ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all ${idx === i ? "w-5 bg-white" : "w-1.5 bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
