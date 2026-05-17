import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { TIERS, useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/job")({
  component: () => (
    <AuthGate>
      <MobileShell><Job /></MobileShell>
    </AuthGate>
  ),
});

type AppTask = {
  name: string;
  short: string;
  downloads: number;
  icon: React.ReactNode;
};

const ICON_BASE = "flex h-full w-full items-center justify-center text-2xl font-black";

const TASKS: AppTask[] = [
  {
    name: "AutoExpreso Móvil",
    short: "AutoExpreso Móvil",
    downloads: 5026,
    icon: (
      <div className={`${ICON_BASE} bg-white text-emerald-500`}>
        <span className="font-serif italic text-4xl">e</span>
      </div>
    ),
  },
  {
    name: "Control Center: Control Styl…",
    short: "Control Center: Control Styles",
    downloads: 4928,
    icon: (
      <div className={`${ICON_BASE} bg-gradient-to-br from-violet-500 to-fuchsia-500`}>
        <span className="h-7 w-7 rounded-full bg-white shadow-inner" />
      </div>
    ),
  },
  {
    name: "Direct Express® Mobile",
    short: "Direct Express® Mobile",
    downloads: 5092,
    icon: (
      <div className={`${ICON_BASE} bg-orange-500 text-green-800 tracking-tighter`}>
        DX
      </div>
    ),
  },
  {
    name: "iScanner - PDF Scanner App",
    short: "iScanner - PDF Scanner App",
    downloads: 74814,
    icon: <div className={`${ICON_BASE} bg-white text-slate-900 text-3xl`}>🖨</div>,
  },
  {
    name: "mewt - business QR 2x pro…",
    short: "mewt - business QR 2x profits",
    downloads: 5017,
    icon: (
      <div className={`${ICON_BASE} bg-black text-white text-sm tracking-tight`}>
        SuperPe
      </div>
    ),
  },
  {
    name: "TikTok - Videos & Music",
    short: "TikTok",
    downloads: 88210,
    icon: <div className={`${ICON_BASE} bg-black text-white text-3xl`}>♪</div>,
  },
  {
    name: "Instagram",
    short: "Instagram",
    downloads: 64203,
    icon: (
      <div className={`${ICON_BASE} bg-gradient-to-tr from-yellow-400 via-pink-500 to-violet-600 text-white text-2xl`}>
        📷
      </div>
    ),
  },
  {
    name: "WhatsApp Messenger",
    short: "WhatsApp",
    downloads: 99231,
    icon: <div className={`${ICON_BASE} bg-emerald-500 text-white text-3xl`}>💬</div>,
  },
  {
    name: "Spotify: Music & Podcasts",
    short: "Spotify",
    downloads: 41880,
    icon: <div className={`${ICON_BASE} bg-black text-emerald-400 text-3xl`}>♫</div>,
  },
  {
    name: "Shopee",
    short: "Shopee",
    downloads: 30221,
    icon: <div className={`${ICON_BASE} bg-orange-500 text-white text-2xl`}>🛍</div>,
  },
];

const TABS = ["Doing", "Audit", "Completed"] as const;
type Tab = typeof TABS[number];

function Job() {
  const { user, completeTask } = useApp();
  const [tab, setTab] = useState<Tab>("Doing");
  const [installing, setInstalling] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [audit, setAudit] = useState<Set<number>>(new Set());

  if (!user) return null;
  const tierInfo = TIERS.find((t) => t.name === user.tier)!;
  const dailyLimit = parseInt(String(tierInfo.tasksPerDay).match(/\d+/)?.[0] || "5", 10);

  const handleInstall = (idx: number) => {
    if (installing !== null) return;
    if (user.tasksCompletedToday >= dailyLimit) {
      toast.error("Daily task limit reached. Upgrade your plan to earn more.");
      return;
    }
    setInstalling(idx);
    setProgress(0);
    const DURATION = 60000; // 1 minute
    const STEP = 1000;
    const started = Date.now();
    const timer = setInterval(() => {
      const pct = Math.min(100, Math.round(((Date.now() - started) / DURATION) * 100));
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(timer);
        setAudit((s) => new Set(s).add(idx));
        setInstalling(null);
        setProgress(0);
        toast.success("Submitted to audit");
        setTimeout(async () => {
          const r = await completeTask(tierInfo.rewardPerTask);
          if (r.ok) {
            setAudit((s) => { const n = new Set(s); n.delete(idx); return n; });
            setCompleted((s) => new Set(s).add(idx));
            toast.success(`+$${tierInfo.rewardPerTask.toFixed(2)} credited`);
          }
        }, 1500);
      }
    }, STEP);
  };

  const visible = TASKS.map((t, i) => ({ t, i })).filter(({ i }) => {
    if (tab === "Doing") return !audit.has(i) && !completed.has(i);
    if (tab === "Audit") return audit.has(i);
    return completed.has(i);
  });

  return (
    <div className="pb-6">
      {/* Header */}
      <div className="relative flex items-center justify-between bg-slate-400/70 px-4 py-3.5">
        <ChevronLeft size={22} className="text-slate-700/70" />
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-slate-900">
          Task list
        </h1>
        <Link to="/account" className="text-base text-slate-800">My</Link>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 bg-sky-100">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative py-3.5 text-base font-semibold"
            >
              <span className={active ? "text-slate-900 font-bold" : "text-slate-500"}>
                {t}
              </span>
              {active && (
                <span className="absolute bottom-2 left-1/2 h-0.5 w-10 -translate-x-1/2 rounded-full bg-slate-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="bg-gradient-to-b from-sky-50 via-white to-pink-100 min-h-[60vh]">
        {visible.length === 0 ? (
          <p className="py-20 text-center text-sm text-slate-400">No more data</p>
        ) : (
          <ul className="divide-y divide-slate-200/60">
            {visible.map(({ t, i }) => (
              <li key={i} className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl shadow-sm">
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {t.downloads.toLocaleString()} downloads
                    </p>
                    <p className="text-xs text-slate-500 truncate">{t.short}</p>
                  </div>
                  {installing !== i && (
                    <button
                      onClick={() => tab === "Doing" && handleInstall(i)}
                      disabled={tab !== "Doing"}
                      className="rounded-md bg-teal-400 px-5 py-2 text-sm font-semibold text-white shadow active:scale-95 disabled:opacity-70"
                    >
                      {tab === "Completed"
                        ? "Done"
                        : tab === "Audit"
                        ? "Auditing"
                        : "Install"}
                    </button>
                  )}
                </div>
                {installing === i && (
                  <div className="mt-3">
                    <p className="text-center text-sm font-semibold text-sky-500">Downloading</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-slate-200 transition-all duration-1000 ease-linear"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-xs text-slate-500">{progress}%</span>
                    </div>
                  </div>
                )}
              </li>
            ))}
            <li className="py-6 text-center text-sm text-slate-400">No more data</li>
          </ul>
        )}
      </div>
    </div>
  );
}
