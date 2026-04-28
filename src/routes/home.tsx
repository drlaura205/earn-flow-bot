import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Gift, Bot, Users, Briefcase, TrendingUp, Bell } from "lucide-react";

export const Route = createFileRoute("/home")({
  component: () => (
    <AuthGate>
      <MobileShell><Home /></MobileShell>
    </AuthGate>
  ),
});

function Home() {
  const { user } = useApp();
  if (!user) return null;
  return (
    <div>
      {/* Header */}
      <div className="bg-hero-gradient px-5 pt-12 pb-20 text-white rounded-b-[2rem]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/70">Welcome back</p>
            <p className="text-lg font-semibold">{user.phone}</p>
          </div>
          <button className="relative h-10 w-10 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <Bell size={18} />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-300" />
          </button>
        </div>

        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-white/70">Total Balance (USDT)</p>
          <p className="mt-1 text-4xl font-black">${user.balance.toFixed(2)}</p>
          <span className="mt-2 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
            {user.tier} Plan
          </span>
        </div>
      </div>

      {/* Floating quick actions */}
      <div className="-mt-12 px-5">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-card p-4 shadow-elevated">
          <QuickLink to="/recharge" icon={ArrowDownToLine} label="Recharge" />
          <QuickLink to="/withdraw" icon={ArrowUpFromLine} label="Withdraw" />
          <QuickLink to="/invite" icon={Gift} label="Invite" />
        </div>
      </div>

      {/* Earnings strip */}
      <div className="mt-5 px-5">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Today" value={user.todayEarnings} />
          <Stat label="Tasks Done" value={user.taskCount} prefix="" suffix="" />
          <Stat label="Total" value={user.totalEarnings} />
        </div>
      </div>

      {/* Feature grid */}
      <div className="mt-6 px-5">
        <h2 className="mb-3 text-base font-bold">Explore</h2>
        <div className="grid grid-cols-4 gap-3">
          <Feature to="/job" icon={Briefcase} label="Tasks" tint="from-cyan-400 to-blue-500" />
          <Feature to="/robot" icon={Bot} label="AI Robot" tint="from-violet-400 to-fuchsia-500" />
          <Feature to="/team" icon={Users} label="Team" tint="from-emerald-400 to-teal-500" />
          <Feature to="/invite" icon={Gift} label="Invite" tint="from-amber-400 to-orange-500" />
          <Feature to="/recharge" icon={Wallet} label="Wallet" tint="from-pink-400 to-rose-500" />
          <Feature to="/job" icon={TrendingUp} label="VIP" tint="from-yellow-400 to-amber-500" />
          <Feature to="/account" icon={Users} label="Profile" tint="from-sky-400 to-indigo-500" />
          <Feature to="/account" icon={Bell} label="News" tint="from-lime-400 to-green-500" />
        </div>
      </div>

      {/* Marquee notice */}
      <div className="mt-5 mx-5 flex items-center gap-2 rounded-xl bg-card px-4 py-3 shadow-card">
        <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive">NOTICE</span>
        <p className="truncate text-xs text-muted-foreground">
          Welcome to GIC! Daily AI returns paid out at 24:00 UTC.
        </p>
      </div>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-gradient text-white shadow-md">
        <Icon size={20} />
      </span>
      <span className="text-xs font-medium text-foreground">{label}</span>
    </Link>
  );
}

function Stat({ label, value, prefix = "$", suffix = "" }: { label: string; value: number; prefix?: string; suffix?: string }) {
  return (
    <div className="rounded-xl bg-card p-3 text-center shadow-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-base font-bold text-foreground">{prefix}{typeof value === "number" ? value.toFixed(prefix ? 2 : 0) : value}{suffix}</p>
    </div>
  );
}

function Feature({ to, icon: Icon, label, tint }: { to: string; icon: any; label: string; tint: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform">
      <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${tint} text-white shadow-md`}>
        <Icon size={22} />
      </span>
      <span className="text-[11px] font-medium text-foreground">{label}</span>
    </Link>
  );
}
