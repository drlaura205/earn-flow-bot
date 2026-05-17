import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import {
  ArrowDownToLine, ArrowUpFromLine, Gift, KeyRound, ShieldCheck,
  ChevronRight, LogOut, History as HistoryIcon,
} from "lucide-react";

export const Route = createFileRoute("/account")({
  component: () => (
    <AuthGate>
      <MobileShell><Account /></MobileShell>
    </AuthGate>
  ),
});

function Account() {
  const { user, logout } = useApp();
  const nav = useNavigate();
  if (!user) return null;

  const grid = [
    { label: "Yesterday", value: 0 },
    { label: "Today", value: user.todayEarnings },
    { label: "AI Robot Today", value: 0 },
    { label: "This Week", value: user.todayEarnings },
    { label: "This Month", value: user.totalEarnings },
    { label: "Total", value: user.totalEarnings },
    { label: "Tasks", value: user.taskCount, isInt: true },
    { label: "Task Rewards", value: user.taskRewards },
    { label: "Referral", value: user.referralRewards },
  ];

  return (
    <div>
      <div className="relative bg-hero-gradient px-5 pt-10 pb-20 rounded-b-[2rem] overflow-hidden">
        <div className="relative flex flex-col items-center text-center">
          <div className="relative">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-fuchsia-500 via-pink-500 to-orange-400 p-[3px] shadow-elevated">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-2xl font-black text-slate-800">
                {user.phone.slice(-2)}
              </span>
            </span>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-800">{user.phone}</p>
          <div className="mt-3 w-full flex items-end justify-between px-2">
            <div className="text-left">
              <p className="text-xs text-slate-700">Main Wallet (USDT)</p>
              <p className="text-3xl font-black text-sky-600">${user.balance.toFixed(2)}</p>
            </div>
            <p className="text-2xl font-black text-sky-600">{user.tier}</p>
          </div>
          <p className="mt-1 self-start text-[11px] text-slate-600">Code: {user.myCode}</p>
        </div>
      </div>

      <div className="-mt-10 px-5">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/60 backdrop-blur-md p-4 shadow-elevated border border-white/40">
          <Quick to="/recharge" icon={ArrowDownToLine} label="Recharge" tint="from-sky-400 to-blue-500" />
          <Quick to="/withdraw" icon={ArrowUpFromLine} label="Withdraw" tint="from-sky-400 to-blue-500" />
          <Quick to="/invite" icon={Gift} label="Invite" tint="from-sky-400 to-blue-500" />
        </div>
      </div>

      <div className="mt-5 px-5">
        <h2 className="mb-3 text-base font-bold">Earnings Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          {grid.map((g) => (
            <div key={g.label} className="rounded-2xl bg-slate-500/25 backdrop-blur-sm p-3 text-center border border-white/30">
              <p className="text-[10px] uppercase tracking-wider text-slate-700">{g.label}</p>
              <p className="mt-1 text-base font-black text-white drop-shadow">
                {g.isInt ? g.value : `$${(g.value as number).toFixed(2)}`}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 px-5 pb-4">
        <div className="overflow-hidden rounded-2xl bg-card shadow-card">
          <Row to="/history" icon={HistoryIcon} label="Deposit & Withdrawal History" tint="from-cyan-500 to-blue-600" />
          <Row to="/personal-info" icon={ShieldCheck} label="Set USDT Wallet Address" tint="from-emerald-500 to-teal-600" />
          <Row to="/fund-password" icon={KeyRound} label="Fund Password" tint="from-amber-500 to-orange-600" />
          <Row to="/invite" icon={Gift} label="Invite Friends" tint="from-fuchsia-500 to-purple-600" />
          <button
            onClick={() => { logout(); nav({ to: "/login" }); }}
            className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-secondary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-md">
              <LogOut size={18} />
            </span>
            <span className="flex-1 text-sm font-semibold text-destructive">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Quick({ to, icon: Icon, label, tint }: { to: string; icon: any; label: string; tint: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} text-white shadow-elevated`}>
        <Icon size={22} />
      </span>
      <span className="text-xs font-semibold">{label}</span>
    </Link>
  );
}

function Row({ to, icon: Icon, label, tint }: { to: string; icon: any; label: string; tint: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 border-b border-border px-4 py-4 last:border-b-0 active:bg-secondary">
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${tint} text-white shadow-md`}>
        <Icon size={18} />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight size={18} className="text-muted-foreground" />
    </Link>
  );
}
