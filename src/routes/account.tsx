import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, Gift, KeyRound, ShieldCheck,
  ChevronRight, LogOut, History as HistoryIcon, Crown, Sparkles,
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
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 px-5 pt-12 pb-16 text-white rounded-b-[2rem] overflow-hidden">
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />

        <div className="relative flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-fuchsia-500 blur-md opacity-70" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-fuchsia-600 p-[3px] shadow-elevated">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-700 to-purple-800 text-2xl font-black tracking-wide">
                {user.phone.slice(-2)}
              </span>
            </span>
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-amber-300 to-orange-500 shadow-md ring-2 ring-white">
              <Crown size={14} className="text-white" />
            </span>
          </div>
          <div>
            <p className="text-lg font-bold">{user.phone}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-sm">
              <Sparkles size={12} className="text-amber-300" />
              {user.tier}
            </span>
            <p className="mt-1 text-[11px] text-white/80">Code: {user.myCode}</p>
          </div>
        </div>

        <div className="relative mt-5 rounded-2xl bg-white/15 p-4 backdrop-blur-md border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Available Balance</p>
            <p className="text-3xl font-black">${user.balance.toFixed(2)}</p>
          </div>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-300 to-orange-500 shadow-md">
            <Wallet size={24} />
          </span>
        </div>
      </div>

      <div className="-mt-8 px-5">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-card p-4 shadow-elevated">
          <Quick to="/recharge" icon={ArrowDownToLine} label="Recharge" tint="from-emerald-500 to-teal-600" />
          <Quick to="/withdraw" icon={ArrowUpFromLine} label="Withdraw" tint="from-orange-500 to-rose-600" />
          <Quick to="/invite" icon={Gift} label="Invite" tint="from-fuchsia-500 to-purple-600" />
        </div>
      </div>

      <div className="mt-5 px-5">
        <h2 className="mb-3 text-base font-bold">Earnings Overview</h2>
        <div className="grid grid-cols-3 gap-3">
          {grid.map((g) => (
            <div key={g.label} className="rounded-xl bg-card p-3 text-center shadow-card">
              <p className="text-base font-black text-foreground">
                {g.isInt ? g.value : `$${(g.value as number).toFixed(2)}`}
              </p>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{g.label}</p>
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
