import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { CompanyPhotoSlider } from "@/components/CompanyPhotoSlider";
import { LiveMembershipList } from "@/components/LiveMembershipList";
import { useApp } from "@/context/AppContext";
import {
  Building2, Wallet, Banknote,
  Crown, Music2, Users, Megaphone, Volume2,
} from "lucide-react";
import logo from "@/assets/gic-logo.png";
import { useLang } from "@/context/LanguageContext";
import { LanguageMenu } from "@/components/LanguageMenu";

const MEMBERS = [
  { id: "4041", brand: "IG", tasks: 20, usdt: 15, color: "from-pink-500 via-rose-500 to-orange-400" },
  { id: "8247", brand: "AZ", tasks: 60, usdt: 135, color: "from-slate-100 to-slate-200 text-slate-800" },
  { id: "3392", brand: "TT", tasks: 35, usdt: 45, color: "from-slate-800 to-black" },
  { id: "5510", brand: "YT", tasks: 12, usdt: 9, color: "from-red-500 to-red-600" },
  { id: "9981", brand: "SP", tasks: 30, usdt: 28, color: "from-emerald-500 to-green-600" },
];

export const Route = createFileRoute("/home")({
  component: () => (
    <AuthGate>
      <MobileShell><Home /></MobileShell>
    </AuthGate>
  ),
});

function Home() {
  const { user } = useApp();
  const { t } = useLang();
  if (!user) return null;

  return (
    <div className="pb-6">
      {/* Top header bar */}
      <div className="flex items-center justify-between bg-slate-400/70 px-4 py-3">
        <LanguageMenu variant="icon" />
        <img src={logo} alt="GIC" className="h-8 object-contain" />
        <div className="relative">
          <Volume2 size={22} className="text-slate-700" />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
        </div>
      </div>

      {/* Company photo slider */}
      <CompanyPhotoSlider />

      {/* Brand banner */}
      <div className="bg-gradient-to-b from-slate-100 to-slate-200 px-4 pt-4 pb-3">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <p className="text-4xl font-black tracking-wider text-slate-900">GIC</p>
            <p className="mt-1 text-lg font-semibold text-slate-800 leading-tight">
              Providing services to<br />
              <span className="font-bold">OEM Operators</span><br />
              <span className="font-bold">Enterprises</span>
            </p>
          </div>
          <div className="grid grid-cols-4 gap-1 w-36 pt-1">
            {["📱","💬","🎵","📷","🎬","📺","🎮","💼","🛒","📧","🌐","⭐","🔔","💎","🎯","🚀"].map((e, i) => (
              <span key={i} className="text-lg leading-none">{e}</span>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
          {["SAMSUNG","verizon","T-Mobile","cricket","AT&T","NOKIA","OPPO"].map((b) => (
            <span key={b} className="text-blue-600">{b}</span>
          ))}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-bold">
          {["mi xiaomi","Karbonn","infinix","TECNO","Lenovo","HUAWEI","vivo"].map((b) => (
            <span key={b} className="text-rose-600">{b}</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="bg-gradient-to-b from-sky-100 via-white to-pink-100 px-4 pt-4">
        {/* Marquee */}
        <div className="flex items-center gap-2 rounded-2xl bg-white/70 border border-white/80 px-3 py-3 shadow-card">
          <Megaphone size={20} className="text-amber-500 shrink-0" />
          <div className="flex-1 overflow-hidden">
            <div className="whitespace-nowrap animate-[marquee_22s_linear_infinite] text-xs text-slate-700">
              Congratulations to member ****1082 for recommending S1 and receiving 1.5U invitation reward.
            </div>
          </div>
        </div>

        {/* Icon menu 2x4 */}
        <div className="mt-5 grid grid-cols-4 gap-y-5">
          <MenuIcon to="/company-profile" icon={Building2} label={t("company_profile")} tint="from-amber-400 to-orange-500" />
          
          <MenuIcon to="/recharge" icon={Wallet} label={t("recharge")} tint="from-sky-400 to-blue-500" />
          <MenuIcon to="/withdraw" icon={Banknote} label={t("withdrawal")} tint="from-emerald-400 to-green-500" />
          <MenuIcon to="/job" icon={Crown} label={t("join")} tint="from-indigo-400 to-violet-500" />
          <MenuIcon to="/account" icon={Music2} label={t("music")} tint="from-fuchsia-400 to-pink-500" />
          
          <MenuIcon to="/invite" icon={Users} label={t("invite_friends")} tint="from-blue-400 to-indigo-500" />
        </div>

        {/* Membership list */}
        <LiveMembershipList />
      </div>

      {/* Floating Online Service */}
      <Link
        to="/account"
        className="fixed bottom-24 right-4 z-40 flex flex-col items-center"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg">
          🎧
        </span>
        <span className="mt-0.5 text-[10px] font-semibold text-slate-700">Online<br/>Service</span>
      </Link>
    </div>
  );
}

function MenuIcon({ to, icon: Icon, label, tint }: { to: string; icon: any; label: string; tint: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} text-white shadow-md`}>
        <Icon size={26} />
      </span>
      <span className="text-[11px] font-medium text-slate-700 text-center leading-tight px-1">{label}</span>
    </Link>
  );
}
