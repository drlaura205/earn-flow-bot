import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { InstallAppDialog } from "@/components/InstallAppDialog";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Users, IdCard, Wallet, Banknote,
  FileText, ClipboardList, Network, LogOut, Download,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  component: () => (
    <AuthGate>
      <MobileShell><Account /></MobileShell>
    </AuthGate>
  ),
});

const fmtDay = (d: Date) => d.toISOString().slice(0, 10);
const TIER_DAYS: Record<string, number> = {
  Intern: 2, C1: 365, C2: 365, C3: 365, C4: 365, C5: 365,
};

const AVATAR_ICONS = [
  { bg: "bg-black", el: <span className="text-white text-2xl">♪</span> }, // TikTok
  { bg: "bg-emerald-500", el: <span className="text-white text-2xl">💬</span> }, // WhatsApp
  { bg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-violet-600", el: <span className="text-white text-xl">📷</span> }, // Instagram
  { bg: "bg-black", el: <span className="text-emerald-400 text-2xl">♫</span> }, // Spotify
  { bg: "bg-orange-500", el: <span className="text-white text-xl">🛍</span> }, // Shopee
  { bg: "bg-blue-600", el: <span className="text-white font-black text-xl">f</span> }, // Facebook
  { bg: "bg-sky-500", el: <span className="text-white text-xl">✈</span> }, // Telegram
  { bg: "bg-red-600", el: <span className="text-white text-xl">▶</span> }, // YouTube
  { bg: "bg-gradient-to-br from-violet-500 to-fuchsia-500", el: <span className="h-6 w-6 rounded-full bg-white" /> },
  { bg: "bg-white", el: <span className="text-emerald-500 font-serif italic text-3xl">e</span> },
];

function Account() {
  const { user, logout } = useApp();
  const nav = useNavigate();
  const [installOpen, setInstallOpen] = useState(false);
  const [earn, setEarn] = useState({ yesterday: 0, week: 0, month: 0 });
  const [purchase, setPurchase] = useState<{ start: Date; end: Date } | null>(null);

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const startToday = new Date(now); startToday.setHours(0, 0, 0, 0);
    const startYest = new Date(startToday); startYest.setDate(startYest.getDate() - 1);
    const startWeek = new Date(startToday); startWeek.setDate(startWeek.getDate() - 6);
    const startMonth = new Date(startToday); startMonth.setDate(startMonth.getDate() - 29);
    supabase
      .from("task_completions")
      .select("reward, completed_at")
      .eq("user_id", user.id)
      .gte("completed_at", startMonth.toISOString())
      .then(({ data }) => {
        if (!data) return;
        let y = 0, w = 0, m = 0;
        for (const r of data) {
          const t = new Date(r.completed_at).getTime();
          const rw = Number(r.reward);
          m += rw;
          if (t >= startWeek.getTime()) w += rw;
          if (t >= startYest.getTime() && t < startToday.getTime()) y += rw;
        }
        setEarn({ yesterday: y, week: w, month: m });
      });
  }, [user?.id, user?.todayEarnings]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("deposits")
      .select("created_at, reviewed_at, status")
      .eq("user_id", user.id)
      .eq("status", "Approved")
      .order("reviewed_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!data || !data.length) { setPurchase(null); return; }
        const d = data[0];
        const start = new Date(d.reviewed_at || d.created_at);
        const days = TIER_DAYS[user.tier] ?? 30;
        const end = new Date(start); end.setDate(end.getDate() + days);
        setPurchase({ start, end });
      });
  }, [user?.id, user?.tier]);

  if (!user) return null;

  // Stable per-user random icon
  const seed = (user.id || user.phone || "x").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const avatar = AVATAR_ICONS[seed % AVATAR_ICONS.length];

  return (
    <div className="pb-6">
      {/* Header with avatar + ID + tier */}
      <div className="bg-gradient-to-b from-slate-300 to-slate-200 px-5 pt-6 pb-4">
        <div className="flex flex-col items-center">
          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow overflow-hidden ${avatar.bg}`}>
            {avatar.el}
          </span>
          <p className="mt-2 text-lg font-black text-slate-900">{user.myCode || user.phone}</p>
        </div>


        <div className="mt-3 flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-700">Main Wallet(USDT)</p>
            <p className="text-3xl font-black text-sky-500">{user.balance.toFixed(2)}</p>
          </div>
          <p className="text-3xl font-black text-sky-500">{user.tier}</p>
        </div>

        <div className="mt-2">
          <p className="text-sm text-slate-700">Commission Wallet(USDT)</p>
          <p className="text-3xl font-black text-sky-500">{user.referralRewards.toFixed(2)}</p>

          <p className="mt-1 text-xs text-slate-600">Effective date:{purchase ? `${fmtDay(purchase.start)}~${fmtDay(purchase.end)}` : " —"}</p>
        </div>
      </div>

      {/* Stats + cards section */}
      <div className="bg-gradient-to-b from-slate-200 via-slate-100 to-pink-100 px-4 pt-4">
        {/* 2x2 earnings */}
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Yesterday's earnings" value={earn.yesterday} />
          <StatBox label="Today's earnings" value={user.todayEarnings} />
          <StatBox label="This month's earnings" value={earn.month || user.todayEarnings} />
          <StatBox label="This week's earnings" value={earn.week || user.todayEarnings} />
        </div>


        {/* 3 wide cards */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <WideBox label="Total revenue" value={user.totalEarnings.toFixed(2)} />
          <WideBox label={<>Subordinate<br/>task<br/>commission</>} value={(user.taskRewards * 0.1).toFixed(2)} />
          <WideBox label={<>Referral<br/>rebate</>} value={user.referralRewards.toFixed(2)} />
        </div>

        {/* 3x3 icon menu */}
        <div className="mt-6 grid grid-cols-3 gap-y-5">
          <MenuIcon to="/invite" icon={Users} label={<>Invite<br/>friends</>} tint="from-sky-400 to-blue-500" />
          <MenuIcon to="/personal-info" icon={IdCard} label={<>Personal<br/>information</>} tint="from-amber-400 to-orange-500" />
          <MenuIcon to="/recharge" icon={Wallet} label="Recharge" tint="from-blue-400 to-indigo-500" />
          <MenuIcon to="/withdraw" icon={Banknote} label="Withdrawal" tint="from-emerald-400 to-green-500" />
          <MenuIcon to="/history" icon={FileText} label={<>Financial<br/>Records</>} tint="from-rose-400 to-red-500" />
          <MenuIcon to="/history" icon={ClipboardList} label={<>Daily<br/>statement</>} tint="from-cyan-400 to-sky-500" />
          <MenuIcon to="/team" icon={Network} label={<>Team<br/>Reports</>} tint="from-fuchsia-400 to-pink-500" />
          
          <button onClick={() => setInstallOpen(true)} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 text-white shadow-md">
              <Download size={26} />
            </span>
            <span className="text-[11px] font-medium text-slate-700 text-center leading-tight">App<br/>Download</span>
          </button>
        </div>

        <button
          onClick={() => { logout(); nav({ to: "/login" }); }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white/70 py-3 text-sm font-bold text-rose-600 shadow active:scale-95"
        >
          <LogOut size={18} /> Log out
        </button>
      </div>

      <InstallAppDialog open={installOpen} onOpenChange={setInstallOpen} />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-500/40 backdrop-blur p-4 shadow-card">
      <p className="text-xs text-white/90">{label}</p>
      <p className="mt-3 text-2xl font-bold text-white">{value.toFixed(2)}</p>
    </div>
  );
}

function WideBox({ label, value }: { label: React.ReactNode; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-500/40 backdrop-blur p-3 shadow-card min-h-[120px] flex flex-col">
      <p className="text-xs text-white/90 leading-tight">{label}</p>
      <p className="mt-auto text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function MenuIcon({ to, icon: Icon, label, tint }: { to: string; icon: any; label: React.ReactNode; tint: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} text-white shadow-md`}>
        <Icon size={26} />
      </span>
      <span className="text-[11px] font-medium text-slate-700 text-center leading-tight">{label}</span>
    </Link>
  );
}
