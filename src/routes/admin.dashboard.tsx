import { createFileRoute } from "@tanstack/react-router";
import { Users, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { AdminGate } from "@/components/AdminLayout";
import { useAdmin } from "@/context/AdminContext";

export const Route = createFileRoute("/admin/dashboard")({
  component: () => (<AdminGate><Dashboard /></AdminGate>),
});

function Dashboard() {
  const { users, deposits, withdrawals } = useAdmin();
  const TIER_PRICE: Record<string, number> = { Intern: 0, C1: 40, C2: 75, C3: 120, C4: 250, C5: 500 };
  const activeInvest = users.reduce((s, u) => s + (TIER_PRICE[u.tier] || 0), 0);
  const sysBal = users.reduce((s, u) => s + u.balance, 0);
  const pending = deposits.filter((d) => d.status === "Pending").length + withdrawals.filter((w) => w.status === "Pending").length;

  const cards = [
    { label: "Total Members", value: users.length.toString(), icon: Users, accent: "from-cyan-500/20 to-cyan-500/5", iconClr: "text-cyan-400" },
    { label: "Active Investments", value: `$${activeInvest.toLocaleString()}`, icon: TrendingUp, accent: "from-emerald-500/20 to-emerald-500/5", iconClr: "text-emerald-400" },
    { label: "System Balance (USDT)", value: `$${sysBal.toFixed(2)}`, icon: Wallet, accent: "from-blue-500/20 to-blue-500/5", iconClr: "text-blue-400" },
    { label: "Pending Requests", value: pending.toString(), icon: AlertCircle, accent: "from-red-500/30 to-red-500/5", iconClr: "text-red-400", danger: pending > 0 },
  ];

  const recent = [...deposits.slice(0, 3).map((d) => ({ ...d, type: "Deposit" as const })), ...withdrawals.slice(0, 3).map((w) => ({ ...w, type: "Withdrawal" as const }))]
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Real-time platform metrics & activity</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className={`relative rounded-2xl border border-slate-800 bg-gradient-to-br ${c.accent} p-5 overflow-hidden`}>
            {c.danger && <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
            <c.icon className={c.iconClr} size={20} />
            <p className="mt-3 text-xs uppercase tracking-wider text-slate-400">{c.label}</p>
            <p className="mt-1 text-2xl font-black text-slate-100">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h2 className="text-sm font-bold text-slate-200 mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="text-left py-2 px-2">Type</th>
                <th className="text-left py-2 px-2">User</th>
                <th className="text-left py-2 px-2">Amount</th>
                <th className="text-left py-2 px-2">Date</th>
                <th className="text-left py-2 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={`${r.type}-${r.id}`} className="border-b border-slate-800/60">
                  <td className="py-2.5 px-2"><span className={`text-xs px-2 py-0.5 rounded-md ${r.type === "Deposit" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}`}>{r.type}</span></td>
                  <td className="py-2.5 px-2 font-mono text-xs">{r.userId}</td>
                  <td className="py-2.5 px-2 font-semibold">${r.amount}</td>
                  <td className="py-2.5 px-2 text-slate-400 text-xs">{r.date}</td>
                  <td className="py-2.5 px-2"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    Approved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${map[status] || ""}`}>{status}</span>;
}
