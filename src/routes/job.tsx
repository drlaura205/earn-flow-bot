import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { TIERS, useApp, type Tier } from "@/context/AppContext";
import { toast } from "sonner";
import { Gem, Smartphone } from "lucide-react";

export const Route = createFileRoute("/job")({
  component: () => (
    <AuthGate>
      <MobileShell><Job /></MobileShell>
    </AuthGate>
  ),
});

const APP_GRID = [
  "TikTok", "Instagram", "Spotify", "Telegram", "Netflix",
  "WhatsApp", "YouTube", "X", "Pinterest", "Minecraft",
  "Snapchat", "Discord", "Reddit", "Twitch", "Uber",
  "Amazon", "eBay", "Shopify", "Zoom", "Slack",
];
const APP_COLORS = [
  "from-pink-500 to-rose-500", "from-fuchsia-500 to-orange-400",
  "from-green-500 to-emerald-600", "from-sky-400 to-blue-500",
  "from-red-500 to-rose-700", "from-emerald-400 to-teal-500",
  "from-red-500 to-red-700", "from-slate-700 to-black",
  "from-red-400 to-pink-500", "from-green-600 to-lime-500",
  "from-yellow-300 to-amber-500", "from-indigo-500 to-violet-600",
  "from-orange-500 to-red-600", "from-purple-500 to-fuchsia-600",
  "from-slate-800 to-black", "from-amber-400 to-orange-500",
  "from-blue-500 to-red-500", "from-emerald-500 to-green-600",
  "from-sky-500 to-blue-600", "from-fuchsia-500 to-purple-600",
];

function Job() {
  const { user, upgradeTier, completeTask } = useApp();
  const [running, setRunning] = useState(false);

  if (!user) return null;
  const tierInfo = TIERS.find((t) => t.name === user.tier)!;
  const dailyLimit = user.tier === "Internship" ? 1 : 5;
  const progress = Math.min(user.tasksCompletedToday, dailyLimit);

  const handleUpgrade = async (tier: Tier) => {
    if (tier === user.tier) return;
    const r = await upgradeTier(tier);
    if (r.ok) toast.success(`Upgraded to ${tier}!`);
    else toast.error(r.msg || "Insufficient balance. Recharge first.");
  };

  const startTask = () => {
    if (running) return;
    if (user.tasksCompletedToday >= dailyLimit) {
      toast.error("Daily task limit reached. Upgrade your plan to earn more.");
      return;
    }
    setRunning(true);
    setTimeout(async () => {
      const r = await completeTask(tierInfo.rewardPerTask);
      setRunning(false);
      if (r.ok) toast.success(`Task Completed! +$${tierInfo.rewardPerTask.toFixed(2)} added`);
      else toast.error(r.msg);
    }, 2500);
  };

  return (
    <div className="px-4 pt-5 pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-black">Your identity</h1>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
          {user.tier}
        </span>
      </div>

      {/* Tier cards stacked */}
      <div className="mt-4 space-y-3">
        {TIERS.map((t, i) => {
          const active = user.tier === t.name;
          return (
            <div
              key={t.name}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-pink-100 p-4 shadow-card border border-white/70"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Gem className="text-sky-500" size={20} />
                  <p className="text-base font-black text-slate-800">{t.name}</p>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((k) => (
                    <span
                      key={k}
                      className={`h-6 w-6 rounded-md bg-gradient-to-br ${APP_COLORS[(i * 3 + k) % APP_COLORS.length]} shadow-sm`}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                Per order <span className="font-bold text-slate-800">${t.rewardPerTask}</span> USDT · Daily Tasks{" "}
                <span className="font-bold text-slate-800">{t.tasksPerDay}</span>
              </p>
              <div className="mt-3 flex items-end justify-between">
                <p className="text-3xl font-black text-slate-800">{t.price}</p>
                <button
                  onClick={() => handleUpgrade(t.name)}
                  disabled={active}
                  className={`rounded-full px-5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 ${
                    active
                      ? "bg-emerald-500 cursor-default"
                      : "bg-gradient-to-r from-teal-400 to-sky-500"
                  }`}
                >
                  {active ? "Current" : "Join now"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* App icons grid 5x4 */}
      <h2 className="mt-6 mb-3 text-base font-bold">Task Area</h2>
      <div className="rounded-2xl bg-white/70 backdrop-blur p-3 shadow-card border border-white/70">
        <div className="grid grid-cols-5 gap-2.5">
          {APP_GRID.map((name, idx) => (
            <div
              key={name}
              className={`aspect-square rounded-xl bg-gradient-to-br ${APP_COLORS[idx % APP_COLORS.length]} flex items-center justify-center text-white shadow-sm`}
              title={name}
            >
              <Smartphone size={16} />
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-pink-100 p-4 shadow-card border border-white/70">
          <p className="text-[11px] text-slate-500">Today's earnings</p>
          <p className="mt-1 text-xl font-black text-teal-600">USDT {user.todayEarnings.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-pink-100 p-4 shadow-card border border-white/70">
          <p className="text-[11px] text-slate-500">Total balance</p>
          <p className="mt-1 text-xl font-black text-teal-600">USDT {user.balance.toFixed(4)}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-4 rounded-2xl bg-white/70 p-4 shadow-card border border-white/70">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Starting</span>
          <span>{progress}/{dailyLimit}</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-sky-500 transition-all"
            style={{ width: `${(progress / dailyLimit) * 100}%` }}
          />
        </div>
      </div>

      <button
        onClick={startTask}
        disabled={running}
        className="mt-4 w-full rounded-full bg-gradient-to-r from-teal-400 to-sky-500 py-4 text-base font-black text-white shadow-elevated active:scale-[0.98] disabled:opacity-70"
      >
        {running ? "Working…" : "Start Task"}
      </button>

      {/* Notice */}
      <div className="mt-5 rounded-2xl bg-white/70 p-4 shadow-card border border-white/70">
        <p className="text-sm font-bold text-slate-800">Important Notice</p>
        <ul className="mt-2 list-disc pl-5 text-xs text-slate-600 space-y-1">
          <li>Working hours: 00:01 – 23:59 UTC daily.</li>
          <li>Rewards are credited instantly to your main wallet.</li>
          <li>Upgrade your tier to unlock more daily tasks and higher per-task rewards.</li>
          <li>Contact Online Service for any task-related issue.</li>
        </ul>
      </div>
    </div>
  );
}
