import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { TIERS, useApp, type Tier } from "@/context/AppContext";
import { toast } from "sonner";
import { Smartphone, Check, Crown } from "lucide-react";

export const Route = createFileRoute("/job")({
  component: () => (
    <AuthGate>
      <MobileShell><Job /></MobileShell>
    </AuthGate>
  ),
});

const APPS = [
  { name: "TikTok", color: "from-pink-500 to-rose-500" },
  { name: "Instagram", color: "from-fuchsia-500 to-orange-400" },
  { name: "Spotify", color: "from-green-500 to-emerald-600" },
  { name: "Telegram", color: "from-sky-400 to-blue-500" },
  { name: "Netflix", color: "from-red-500 to-rose-700" },
  { name: "WhatsApp", color: "from-emerald-400 to-teal-500" },
  { name: "YouTube", color: "from-red-500 to-red-700" },
  { name: "X (Twitter)", color: "from-slate-700 to-black" },
];

function Job() {
  const { user, upgradeTier, completeTask } = useApp();
  const [installing, setInstalling] = useState<number | null>(null);
  const [completed, setCompleted] = useState<Set<number>>(new Set());

  if (!user) return null;
  const tierInfo = TIERS.find((t) => t.name === user.tier)!;

  const dailyLimit = user.tier === "Internship" ? 1 : Infinity;

  const install = (idx: number) => {
    if (completed.has(idx) || installing !== null) return;
    if (user.tasksCompletedToday >= dailyLimit) {
      toast.error("Daily task limit reached. Upgrade your plan to earn more.");
      return;
    }
    setInstalling(idx);
    setTimeout(() => {
      setInstalling(null);
      setCompleted((s) => new Set(s).add(idx));
      completeTask(tierInfo.rewardPerTask);
      toast.success(`Task Completed! +$${tierInfo.rewardPerTask.toFixed(2)} added`);
    }, 3000);
  };

  const handleUpgrade = (tier: Tier) => {
    if (tier === user.tier) return;
    if (upgradeTier(tier)) {
      toast.success(`Upgraded to ${tier}!`);
    } else {
      toast.error("Insufficient balance. Recharge first.");
    }
  };

  return (
    <div className="px-5 pt-8">
      <h1 className="text-2xl font-black">Daily Tasks</h1>
      <p className="text-sm text-muted-foreground">Install apps and earn USDT instantly</p>

      {/* Tier picker */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {TIERS.map((t) => {
          const active = user.tier === t.name;
          return (
            <button
              key={t.name}
              onClick={() => handleUpgrade(t.name)}
              className={`relative shrink-0 rounded-2xl bg-gradient-to-br ${t.color} p-4 text-left text-white shadow-md min-w-[150px] active:scale-95 transition-transform ${active ? "ring-4 ring-[var(--blue-brand)]/40" : ""}`}
            >
              {active && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <Crown size={18} />
              <p className="mt-2 text-base font-bold">{t.name}</p>
              <p className="text-xs opacity-90">${t.price} • {t.tasksPerDay} tasks/day</p>
              <p className="mt-1 text-[11px] opacity-80">${t.rewardPerTask}/task</p>
            </button>
          );
        })}
      </div>

      {/* Today summary */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-card p-3 shadow-card">
        <Mini label="Plan" value={user.tier} />
        <Mini label="Done today" value={String(user.tasksCompletedToday)} />
        <Mini label="Per task" value={`$${tierInfo.rewardPerTask}`} />
      </div>

      {/* Task list */}
      <h2 className="mt-6 mb-3 text-base font-bold">Available Tasks</h2>
      <div className="space-y-3">
        {APPS.map((app, idx) => {
          const isInstalling = installing === idx;
          const isDone = completed.has(idx);
          return (
            <div key={app.name} className="flex items-center gap-3 rounded-xl bg-card p-3 shadow-card">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${app.color} text-white`}>
                <Smartphone size={22} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{app.name}</p>
                <p className="text-xs text-muted-foreground">Reward +${tierInfo.rewardPerTask.toFixed(2)}</p>
              </div>
              <button
                disabled={isInstalling || isDone}
                onClick={() => install(idx)}
                className={`rounded-full px-4 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-70 ${
                  isDone ? "bg-emerald-500" : "bg-primary-gradient"
                }`}
              >
                {isDone ? "Completed" : isInstalling ? "Installing…" : "Install"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}
