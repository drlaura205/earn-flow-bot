import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { Bot, Zap, TrendingUp, Activity } from "lucide-react";

export const Route = createFileRoute("/robot")({
  component: () => (
    <AuthGate>
      <MobileShell><Robot /></MobileShell>
    </AuthGate>
  ),
});

function Robot() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setProgress((p) => (p + 1) % 100), 80);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div className="bg-hero-gradient px-5 pt-12 pb-12 text-white rounded-b-[2rem]">
        <h1 className="text-2xl font-black">AI Trading Robot</h1>
        <p className="text-sm text-white/80">Automated returns 24/7</p>
      </div>

      <div className="-mt-8 px-5">
        <div className="rounded-3xl bg-card p-6 shadow-elevated text-center">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-300 to-blue-500 opacity-20 animate-pulse" />
            <div className="absolute inset-2 flex items-center justify-center rounded-full bg-primary-gradient shadow-glow">
              <Bot size={56} className="text-white" />
            </div>
          </div>
          <p className="mt-4 text-base font-bold">Robot Status: <span className="text-emerald-500">Active</span></p>
          <p className="text-xs text-muted-foreground">Scanning markets…</p>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full bg-primary-gradient transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <RobotStat icon={Zap} label="Trades" value="142" />
          <RobotStat icon={TrendingUp} label="Win Rate" value="87%" />
          <RobotStat icon={Activity} label="Today" value="$0.00" />
        </div>

        <div className="mt-5 rounded-xl bg-card p-4 shadow-card">
          <h3 className="text-sm font-bold">Live Signals</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {["BTC/USDT — Long", "ETH/USDT — Short", "BNB/USDT — Long", "SOL/USDT — Long"].map((s, i) => (
              <li key={s} className="flex items-center justify-between rounded-lg bg-secondary px-3 py-2">
                <span className="font-medium">{s}</span>
                <span className={`text-xs font-bold ${i % 2 ? "text-destructive" : "text-emerald-500"}`}>
                  {i % 2 ? "-" : "+"}{(Math.random() * 2 + 0.1).toFixed(2)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RobotStat({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-card p-3 text-center shadow-card">
      <Icon size={18} className="mx-auto text-[var(--blue-brand)]" />
      <p className="mt-1 text-base font-bold">{value}</p>
      <p className="text-[10px] uppercase text-muted-foreground">{label}</p>
    </div>
  );
}
