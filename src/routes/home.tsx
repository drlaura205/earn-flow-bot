import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import {
  Gift, User as UserIcon, ArrowDownToLine, ArrowUpFromLine,
  FileText, ClipboardList, Users, BookOpen,
} from "lucide-react";
import gicLogo from "@/assets/gic-logo.png";

export const Route = createFileRoute("/home")({
  component: () => (
    <AuthGate>
      <MobileShell><Home /></MobileShell>
    </AuthGate>
  ),
});

function fmtDateRange() {
  const start = new Date();
  const end = new Date(); end.setDate(end.getDate() + 4);
  const f = (d: Date) => d.toISOString().slice(0, 10);
  return `${f(start)} ~ ${f(end)}`;
}

function Home() {
  const { user } = useApp();
  if (!user) return null;

  return (
    <div className="px-4 pt-4 pb-4">
      {/* Top bar: logo + user id + tier badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={gicLogo} alt="GIC" className="h-9 w-9 rounded-xl shadow" />
          <span className="font-mono text-sm font-bold text-slate-700">
            {user.myCode || user.phone}
          </span>
        </div>
        <span className="rounded-full bg-gradient-to-r from-sky-400 to-blue-500 px-3 py-1 text-[11px] font-bold text-white shadow">
          {user.tier}
        </span>
      </div>

      {/* Wallet card */}
      <div className="mt-4 rounded-2xl bg-gradient-to-br from-sky-100 via-white to-pink-100 p-5 shadow-elevated border border-white/70">
        <p className="text-[11px] uppercase tracking-widest text-slate-500">Main Wallet (USDT)</p>
        <p className="mt-1 text-4xl font-black text-sky-600">{user.balance.toFixed(2)}</p>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-slate-500">Commission Wallet (USDT)</p>
            <p className="mt-1 text-2xl font-extrabold text-teal-600">
              {user.referralRewards.toFixed(4)}
            </p>
          </div>
          <p className="text-[10px] text-slate-500">Effective date: {fmtDateRange()}</p>
        </div>
      </div>

      {/* 2x2 stats grid */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <StatBox label="Yesterday's earnings" value={0} />
        <StatBox label="Today's earnings" value={user.todayEarnings} />
        <StatBox label="This month's earnings" value={user.totalEarnings} />
        <StatBox label="This week's earnings" value={user.todayEarnings * 7} />
      </div>

      {/* 3 wide cards */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <WideCard label="Total revenue" value={user.totalEarnings.toFixed(2)} />
        <WideCard label="Sub. task commission" value={(user.taskRewards * 0.1).toFixed(1)} />
        <WideCard label="Referral rebate" value={user.referralRewards.toFixed(1)} />
      </div>

      {/* Icon menu 2x4 */}
      <div className="mt-5 rounded-2xl bg-white/70 backdrop-blur p-4 shadow-card border border-white/70">
        <div className="grid grid-cols-4 gap-y-5 gap-x-2">
          <MenuIcon to="/invite" icon={Gift} label="Invite Friends" tint="from-pink-400 to-rose-500" />
          <MenuIcon to="/personal-info" icon={UserIcon} label="Personal Info" tint="from-sky-400 to-blue-500" />
          <MenuIcon to="/recharge" icon={ArrowDownToLine} label="Recharge" tint="from-emerald-400 to-teal-500" />
          <MenuIcon to="/withdraw" icon={ArrowUpFromLine} label="Withdrawal" tint="from-orange-400 to-red-500" />
          <MenuIcon to="/history" icon={FileText} label="Financial Records" tint="from-violet-400 to-fuchsia-500" />
          <MenuIcon to="/history" icon={ClipboardList} label="Daily Statement" tint="from-amber-400 to-yellow-500" />
          <MenuIcon to="/team" icon={Users} label="Team Reports" tint="from-cyan-400 to-sky-500" />
          <MenuIcon to="/account" icon={BookOpen} label="Handbook" tint="from-lime-400 to-green-500" />
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-800/90 p-4 shadow-card text-white">
      <p className="text-[11px] text-slate-300">{label}</p>
      <p className="mt-2 text-2xl font-black text-teal-300">{value.toFixed(2)}</p>
    </div>
  );
}

function WideCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-pink-50 p-3 shadow-card border border-white/70 text-center">
      <p className="text-[10px] text-slate-500 leading-tight">{label}</p>
      <p className="mt-1 text-lg font-black text-sky-600">{value}</p>
    </div>
  );
}

function MenuIcon({ to, icon: Icon, label, tint }: { to: string; icon: any; label: string; tint: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} text-white shadow-md`}>
        <Icon size={22} />
      </span>
      <span className="text-[10px] font-medium text-slate-700 text-center leading-tight">{label}</span>
    </Link>
  );
}
