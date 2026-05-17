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
    setTimeout(async () => {
      const r = await completeTask(tierInfo.rewardPerTask);
      setInstalling(null);
      if (r.ok) {
        setCompleted((s) => new Set(s).add(idx));
        toast.success(`Task Completed! +$${tierInfo.rewardPerTask.toFixed(2)} added`);
      } else {
        toast.error(r.msg);
      }
    }, 3000);
  };

  const handleUpgrade = async (tier: Tier) => {
    if (tier === user.tier) return;
    const r = await upgradeTier(tier);
    if (r.ok) toast.success(`Upgraded to ${tier}!`);
    else toast.error(r.msg || "Insufficient balance. Recharge first.");
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
              className={`relative shrink-0 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 p-4 text-left text-slate-800 shadow-card min-w-[180px] active:scale-95 transition-transform ${active ? "ring-4 ring-sky-400/50" : ""}`}
            >
              {active && (
                <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white">
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
              <Crown size={18} className="text-sky-500" />
              <p className="mt-2 text-base font-black">{t.name}</p>
              <p className="text-xs text-slate-600">Per order <span className="font-bold text-slate-800">${t.rewardPerTask}</span></p>
              <p className="text-xs text-slate-600">Daily Tasks: <span className="font-bold text-slate-800">{t.tasksPerDay}</span></p>
              <span className={`mt-3 inline-block rounded-full px-4 py-1.5 text-xs font-bold text-white shadow-md ${active ? "bg-emerald-500" : "bg-gradient-to-r from-sky-400 to-blue-500"}`}>
                {active ? "Joined" : "Join now"}
              </span>
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
                className={`rounded-full px-5 py-2 text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-70 ${
                  isDone ? "bg-emerald-500" : "bg-gradient-to-r from-sky-400 to-blue-500"
                }`}
              >
                {isDone ? "Completed" : isInstalling ? "Installing…" : "Start Task"}
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
