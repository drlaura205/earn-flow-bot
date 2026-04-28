import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import {
  Wallet, ArrowDownToLine, ArrowUpFromLine, Gift, KeyRound, ShieldCheck,
  ChevronRight, LogOut, User as UserIcon,
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
      <div className="bg-hero-gradient px-5 pt-12 pb-16 text-white rounded-b-[2rem]">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm shadow-glow">
            <UserIcon size={28} />
          </span>
          <div>
            <p className="text-lg font-bold">{user.phone}</p>
            <p className="text-xs text-white/80">{user.tier} • Code: {user.myCode}</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-white/15 p-4 backdrop-blur-sm flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Available Balance</p>
            <p className="text-3xl font-black">${user.balance.toFixed(2)}</p>
          </div>
          <Wallet size={32} />
        </div>
      </div>

      <div className="-mt-8 px-5">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-card p-4 shadow-elevated">
          <Quick to="/recharge" icon={ArrowDownToLine} label="Recharge" />
          <Quick to="/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
          <Quick to="/invite" icon={Gift} label="Invite" />
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

      <div className="mt-5 px-5">
        <div className="overflow-hidden rounded-2xl bg-card shadow-card">
          <Row to="/personal-info" icon={ShieldCheck} label="Set USDT Wallet Address" />
          <Row to="/fund-password" icon={KeyRound} label="Fund Password" />
          <Row to="/invite" icon={Gift} label="Invite Friends" />
          <button
            onClick={() => { logout(); nav({ to: "/login" }); }}
            className="flex w-full items-center gap-3 px-4 py-4 text-left active:bg-secondary"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <LogOut size={18} />
            </span>
            <span className="flex-1 text-sm font-medium text-destructive">Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Quick({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-md">
        <Icon size={20} />
      </span>
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

function Row({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-3 border-b border-border px-4 py-4 last:border-b-0 active:bg-secondary">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={18} />
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      <ChevronRight size={18} className="text-muted-foreground" />
    </Link>
  );
}
