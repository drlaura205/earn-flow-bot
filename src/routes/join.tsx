import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { TIERS, useApp, type Tier } from "@/context/AppContext";
import { toast } from "sonner";
import { Gem } from "lucide-react";

export const Route = createFileRoute("/join")({
  component: () => (
    <AuthGate>
      <MobileShell><Join /></MobileShell>
    </AuthGate>
  ),
});

function Join() {
  const { user, upgradeTier } = useApp();
  if (!user) return null;

  const handleUpgrade = async (tier: Tier) => {
    if (tier === user.tier) return;
    const r = await upgradeTier(tier);
    if (r.ok) toast.success(`Upgraded to ${tier}!`);
    else toast.error(r.msg || "Insufficient balance. Recharge first.");
  };

  return (
    <div className="px-4 pt-5 pb-6 space-y-4">
      {TIERS.map((t) => {
        const active = user.tier === t.name;
        const locked = !!t.locked;
        return (
          <div
            key={t.name}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-100 via-white to-pink-100 p-5 shadow-card border border-white/70 min-h-[170px]"
          >
            <div className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_30%,#ffd1dc_0,transparent_40%),radial-gradient(circle_at_95%_70%,#bae6fd_0,transparent_45%)]" />

            {active && (
              <span className="absolute right-4 top-3 text-xs font-bold text-emerald-600">
                Your identity
              </span>
            )}
            {locked && !active && (
              <span className="absolute right-4 top-3 rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Coming soon
              </span>
            )}

            <div className="relative flex gap-4">
              <div className="flex w-24 flex-col items-center">
                <Gem size={44} className="text-sky-500 drop-shadow" strokeWidth={1.5} />
                <p className="mt-2 text-base font-black text-slate-800">{t.name}</p>
                {t.name === "Intern" && (
                  <p className="text-[10px] font-bold text-emerald-600">FREE</p>
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="text-slate-700">Daily income</p>
                <p className="text-lg font-black text-slate-900">USDT {t.dailyIncome.toFixed(2)}</p>
                <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-slate-700">
                  <p>Daily tasks: <span className="font-bold text-slate-900">{t.tasksPerDay}</span></p>
                  <p>Per task: <span className="font-bold text-slate-900">${t.rewardPerTask.toFixed(2)}</span></p>
                  <p className="col-span-2">Duration: <span className="font-bold text-slate-900">{t.durationDays} days</span></p>
                </div>
              </div>
            </div>

            <div className="relative mt-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Deposit</p>
                <p className="text-3xl font-black text-slate-900">${t.price}</p>
              </div>
              {!active && (
                <button
                  onClick={() => !locked && handleUpgrade(t.name)}
                  disabled={locked}
                  className={`rounded-full px-8 py-2.5 text-sm font-bold text-white shadow-md active:scale-95 ${
                    locked
                      ? "bg-slate-400 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-sky-400 to-blue-500"
                  }`}
                >
                  {locked ? "Locked" : "Join now"}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
