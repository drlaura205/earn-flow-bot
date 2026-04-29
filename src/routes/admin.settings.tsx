import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { AdminGate } from "@/components/AdminLayout";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: () => (<AdminGate><SettingsPage /></AdminGate>),
});

function SettingsPage() {
  const { settings, updateSettings } = useAdmin();
  const [s, setS] = useState(settings);
  const [busy, setBusy] = useState(false);

  // sync local state when settings load from Cloud
  useEffect(() => { setS(settings); }, [settings]);

  const save = async () => {
    setBusy(true);
    try { await updateSettings(s); toast.success("Settings saved"); }
    catch (e: any) { toast.error(e?.message || "Failed to save"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Global rates, wallet & withdrawal configuration</p>
      </header>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-sm font-bold text-slate-200 mb-4">Daily Earnings per Tier (USDT)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["Internship", "Silver", "Gold", "Platinum"] as const).map((t) => (
            <div key={t}>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">{t}</label>
              <input type="number" step="0.5" value={s.dailyRates[t]}
                onChange={(e) => setS({ ...s, dailyRates: { ...s.dailyRates, [t]: parseFloat(e.target.value) || 0 } })}
                className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-sm font-bold text-slate-200 mb-4">Wallet Settings</h2>
        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Company TRC-20 Address (shown on Recharge page)</label>
        <input value={s.walletAddress} onChange={(e) => setS({ ...s, walletAddress: e.target.value })}
          className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-sm font-mono text-slate-100 outline-none focus:border-cyan-500" />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-sm font-bold text-slate-200 mb-4">Withdrawal Limits</h2>
        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Minimum Withdrawal (USDT)</label>
        <input type="number" step="0.1" min="0" value={s.minWithdrawal}
          onChange={(e) => setS({ ...s, minWithdrawal: parseFloat(e.target.value) || 0 })}
          className="w-40 rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500" />
      </section>

      <button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg active:scale-[0.98]">
        <Save size={14} /> Save Changes
      </button>
    </div>
  );
}
