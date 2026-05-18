import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/PageHeader";
import logo from "@/assets/gic-logo.png";

export const Route = createFileRoute("/company-profile")({
  head: () => ({
    meta: [
      { title: "Company Profile — GIC" },
      { name: "description", content: "GIC — a Spain-based global investment and technology company." },
    ],
  }),
  component: () => (
    <MobileShell>
      <CompanyProfile />
    </MobileShell>
  ),
});

const GALLERY = [
  "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=500&q=70",
  "https://images.unsplash.com/photo-1559223607-a43c990c692c?auto=format&fit=crop&w=500&q=70",
];

const EVENT_PHOTOS = [
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=400&q=70",
  "https://images.unsplash.com/photo-1559223694-98ed5e272fef?auto=format&fit=crop&w=400&q=70",
];

const BRANCHES = [
  { city: "Madrid", country: "Spain", flag: "🇪🇸" },
  { city: "Barcelona", country: "Spain", flag: "🇪🇸" },
  { city: "London", country: "UK", flag: "🇬🇧" },
  { city: "Berlin", country: "Germany", flag: "🇩🇪" },
  { city: "Amsterdam", country: "Netherlands", flag: "🇳🇱" },
];

function CompanyProfile() {
  return (
    <div className="pb-8 bg-white">
      <PageHeader title="Company Profile" />

      {/* Top gallery 3x2 */}
      <div className="grid grid-cols-3 gap-0.5">
        {GALLERY.map((src, i) => (
          <div key={i} className="aspect-square overflow-hidden bg-slate-200">
            <img src={src} alt="GIC event" className="h-full w-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      {/* Body on blue gradient */}
      <div className="bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 px-3 pt-5 pb-6 space-y-4">
        {/* 01 — About us hero */}
        <section className="rounded-2xl bg-sky-50 p-5 shadow-card">
          <div className="flex flex-col items-center">
            <img src={logo} alt="GIC" className="h-20 object-contain" />
            <div className="mt-2 -skew-x-12 bg-sky-300/80 px-8 py-1.5">
              <p className="skew-x-12 text-white text-xl font-bold tracking-wide">About us</p>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-stone-100/80 p-4">
            <div className="flex items-start gap-2">
              <Badge n="01" color="bg-amber-400" />
              <div>
                <p className="font-bold text-slate-900">Global Investment Company (GIC)</p>
                <p className="mt-1 text-sm text-slate-700 leading-relaxed">
                  Founded in 2016, GIC is headquartered in Madrid, Spain, with regional branches across the UK, Germany, Netherlands, and other European countries.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-1 text-center">
              {BRANCHES.map((b) => (
                <div key={b.city} className="flex flex-col items-center">
                  <span className="text-2xl">{b.flag}</span>
                  <span className="mt-1 text-[10px] font-semibold text-slate-700 leading-tight">{b.city}</span>
                  <span className="text-[9px] font-bold text-slate-900">{b.country}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 02 */}
        <section className="rounded-2xl bg-pink-50 p-4 shadow-card relative">
          <Badge n="02" color="bg-rose-400" className="absolute top-3 right-3" />
          <div className="flex gap-3 items-start">
            <img
              src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=400&q=70"
              alt="Conference"
              className="w-28 h-32 object-cover rounded-md shrink-0"
            />
            <p className="text-sm text-slate-700 leading-relaxed pr-6">
              GIC is a high-tech investment company leading the way in digital innovation and AI-driven trading. We have supported renowned global brands such as TikTok, YouTube, Foodpanda, Netflix, and Careem. We are also committed to fostering the next generation of internet pioneers through our startup support fund, providing financial and marketing expertise.
            </p>
          </div>
        </section>

        {/* 03 */}
        <section className="rounded-2xl bg-orange-50 p-4 shadow-card relative">
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <Badge n="03" color="bg-emerald-500" />
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                GIC has partnered with iconic companies such as Angry Birds and Amazon, which have become global technology leaders. Our position in the sector allows us to collaborate closely with promising startups across fast-growing European markets.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=400&q=70"
              alt="Gaming"
              className="w-28 h-28 object-cover rounded-md shrink-0"
            />
          </div>
        </section>

        {/* 04 */}
        <section className="rounded-2xl bg-pink-50 p-4 shadow-card relative">
          <Badge n="04" color="bg-violet-400" className="absolute top-3 right-3" />
          <div className="flex gap-3 items-start">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=400&q=70"
              alt="Tech"
              className="w-28 h-32 object-cover rounded-md shrink-0"
            />
            <p className="text-sm text-slate-700 leading-relaxed pr-6">
              Across Europe and beyond, where the digital sector is growing at an unprecedented pace, GIC is proud to have contributed to the success of companies such as RapidTV, Spotify, and many others. By combining innovation and opportunity, GIC continues to shape the region's digital landscape.
            </p>
          </div>
        </section>

        {/* 05 */}
        <section className="rounded-2xl bg-pink-50 p-4 shadow-card">
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <Badge n="05" color="bg-pink-500" />
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                To further expand these benefits, GIC launched its internal earning platform in 2019. The company has not only created new income opportunities throughout Europe but has also increased the income of its team members, further solidifying our mission to grow alongside emerging markets.
              </p>
            </div>
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=70"
              alt="Team"
              className="w-28 h-32 object-cover rounded-md shrink-0"
            />
          </div>
        </section>

        {/* 06 */}
        <section className="rounded-2xl bg-emerald-50 p-4 shadow-card text-center">
          <div className="flex justify-center">
            <Badge n="06" color="bg-amber-400" />
          </div>
          <p className="mt-2 text-sm text-slate-700 leading-relaxed">
            At GIC, our work contributes to the development of the European digital ecosystem. Together, we enable more people to enjoy the benefits of technology and create a smarter, more connected future.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-1">
            {EVENT_PHOTOS.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-md bg-slate-200">
                <img src={src} alt="event" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Badge({ n, color, className = "" }: { n: string; color: string; className?: string }) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center text-[11px] font-bold text-white ${color} ${className}`}
      style={{ clipPath: "polygon(50% 0, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)" }}
    >
      {n}
    </span>
  );
}
