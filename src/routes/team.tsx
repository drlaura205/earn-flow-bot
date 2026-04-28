import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import { Users, Search } from "lucide-react";

export const Route = createFileRoute("/team")({
  component: () => (
    <AuthGate>
      <MobileShell><Team /></MobileShell>
    </AuthGate>
  ),
});

function Team() {
  const { user } = useApp();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  if (!user) return null;

  const levels = [
    { name: "Level A", count: 0, commission: "10%", deposits: 0 },
    { name: "Level B", count: 0, commission: "5%", deposits: 0 },
    { name: "Level C", count: 0, commission: "2%", deposits: 0 },
  ];
  const total = levels.reduce((a, b) => a + b.count, 0);

  return (
    <div>
      <div className="bg-hero-gradient px-5 pt-12 pb-10 text-white rounded-b-[2rem]">
        <h1 className="text-2xl font-black">My Team</h1>
        <p className="text-sm text-white/80">Build your downline, earn lifetime commissions</p>

        <div className="mt-5 rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Users size={22} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Team Size</p>
              <p className="text-3xl font-black">{total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <div className="rounded-xl bg-card p-4 shadow-card">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filter by Date</p>
          <div className="flex items-center gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <span className="text-muted-foreground">→</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm" />
            <button className="rounded-lg bg-primary-gradient p-2 text-white shadow-md">
              <Search size={16} />
            </button>
          </div>
        </div>

        <h2 className="mt-6 mb-3 text-base font-bold">Level Breakdown</h2>
        <div className="space-y-3">
          {levels.map((l) => (
            <div key={l.name} className="rounded-xl bg-card p-4 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">{l.name}</p>
                  <p className="text-xs text-muted-foreground">Commission: {l.commission}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-[var(--blue-brand)]">{l.count}</p>
                  <p className="text-[11px] text-muted-foreground">members</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-secondary px-2 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Deposits</p>
                  <p className="text-sm font-bold">${l.deposits.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-secondary px-2 py-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Earned</p>
                  <p className="text-sm font-bold">$0.00</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-card p-4 shadow-card text-center">
          <p className="text-xs text-muted-foreground">Total Referral Rewards</p>
          <p className="mt-1 text-2xl font-black">${user.referralRewards.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
