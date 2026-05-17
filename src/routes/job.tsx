import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { TIERS, useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { TrendingUp, PieChart } from "lucide-react";

export const Route = createFileRoute("/job")({
  component: () => (
    <AuthGate>
      <MobileShell><Job /></MobileShell>
    </AuthGate>
  ),
});

// 20 app tiles — label + bg + text color
const APPS = [
  { l: "M", bg: "bg-slate-200", t: "text-sky-500" },
  { l: "R", bg: "bg-orange-500", t: "text-white" },
  { l: "E", bg: "bg-blue-600", t: "text-white" },
  { l: "🎁", bg: "bg-white", t: "text-sky-500" },
  { l: "A", bg: "bg-black", t: "text-yellow-400" },
  { l: "kari", bg: "bg-pink-700", t: "text-white" },
  { l: "🎬", bg: "bg-blue-700", t: "text-white" },
  { l: "/", bg: "bg-black", t: "text-white" },
  { l: "☂", bg: "bg-white", t: "text-emerald-600" },
  { l: "W", bg: "bg-violet-500", t: "text-white" },
  { l: "Wink", bg: "bg-orange-500", t: "text-white" },
  { l: "S", bg: "bg-red-600", t: "text-white" },
  { l: "♥", bg: "bg-sky-400", t: "text-white" },
  { l: "P", bg: "bg-emerald-500", t: "text-white" },
  { l: "🛍", bg: "bg-white", t: "text-pink-500" },
  { l: "M", bg: "bg-gradient-to-br from-green-700 to-amber-800", t: "text-white" },
  { l: "✦", bg: "bg-white", t: "text-violet-500" },
  { l: "P", bg: "bg-white", t: "text-red-600" },
  { l: "🎮", bg: "bg-orange-700", t: "text-white" },
  { l: "♪", bg: "bg-black", t: "text-white" },
];

function Job() {
  const { user, completeTask } = useApp();
  const [running, setRunning] = useState(false);

  if (!user) return null;
  const tierInfo = TIERS.find((t) => t.name === user.tier)!;
  const dailyLimit = parseInt(String(tierInfo.tasksPerDay).match(/\d+/)?.[0] || "5", 10);
  const progress = Math.min(user.tasksCompletedToday, dailyLimit);

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
    <div className="px-4 pt-4 pb-6">
      {/* App icons grid 5x4 */}
      <div className="grid grid-cols-5 gap-2.5">
        {APPS.map((a, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-xl ${a.bg} ${a.t} flex items-center justify-center text-lg font-black shadow-sm`}
          >
            {a.l}
          </div>
        ))}
      </div>

      {/* Summary cards */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-5 shadow-card text-center">
          <TrendingUp className="mx-auto text-sky-500" size={28} />
          <p className="mt-2 text-sm text-slate-700">Today's earnings</p>
          <p className="mt-2 text-lg font-black text-slate-900">USDT {user.todayEarnings.toFixed(0)}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-card text-center">
          <PieChart className="mx-auto text-sky-500" size={28} />
          <p className="mt-2 text-sm text-sky-500 font-semibold">Total balance</p>
          <p className="mt-2 text-lg font-black text-slate-900">USDT {user.balance.toFixed(4)}</p>
        </div>
      </div>

      {/* Progress + Start Task card */}
      <div className="mt-5 rounded-2xl bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <span className="text-xl font-black text-slate-900">Starting</span>
          <span className="text-xl font-black text-slate-900">{progress}/{dailyLimit}</span>
        </div>
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-teal-400 to-sky-500 transition-all"
            style={{ width: `${(progress / dailyLimit) * 100}%` }}
          />
        </div>
        <button
          onClick={startTask}
          disabled={running}
          className="mt-5 mx-auto block rounded-full bg-sky-400 px-12 py-3 text-base font-bold text-white shadow active:scale-[0.98] disabled:opacity-70"
        >
          {running ? "Working…" : "Start Task"}
        </button>
      </div>

      {/* Notice */}
      <div className="mt-5">
        <p className="text-base font-bold text-slate-800">Important Notice</p>
        <ul className="mt-2 text-xs text-slate-600 space-y-1">
          <li>• Working hours: 00:01 – 23:59</li>
          <li>• If you need assistance, please contact your hiring manager.</li>
          <li>• Rewards are credited instantly to your main wallet.</li>
          <li>• Upgrade your tier to unlock more daily tasks.</li>
        </ul>
      </div>
    </div>
  );
}
