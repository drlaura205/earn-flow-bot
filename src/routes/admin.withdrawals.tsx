import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, Copy } from "lucide-react";
import { AdminGate } from "@/components/AdminLayout";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/withdrawals")({
  component: () => (<AdminGate><Withdrawals /></AdminGate>),
});

function Withdrawals() {
  const { withdrawals, payWithdrawal, rejectWithdrawal } = useAdmin();
  const [pendingOnly, setPendingOnly] = useState(true);
  const list = pendingOnly ? withdrawals.filter((w) => w.status === "Pending") : withdrawals;
  const copy = (t: string) => { navigator.clipboard.writeText(t); toast.success("Address copied"); };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Withdrawal Requests</h1>
          <p className="text-sm text-slate-400 mt-1">Process outgoing BEP-20 USDT payouts</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={pendingOnly} onChange={(e) => setPendingOnly(e.target.checked)} className="accent-cyan-500" />
          Pending only
        </label>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-900/80">
              <tr>
                <th className="text-left py-3 px-4">User</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">BEP-20 Address</th>
                <th className="text-left py-3 px-4">Network</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((w) => (
                <tr key={w.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-xs">{w.userId}</td>
                  <td className="py-3 px-4 font-bold text-amber-300">${w.amount}</td>
                  <td className="py-3 px-4">
                    <button onClick={() => copy(w.address)} className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-300 hover:text-cyan-300">
                      {w.address.slice(0, 10)}…{w.address.slice(-8)} <Copy size={12} />
                    </button>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-400">{w.network}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{w.date}</td>
                  <td className="py-3 px-4"><StatusBadge status={w.status} /></td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={w.status !== "Pending"}
                        onClick={() => { payWithdrawal(w.id); toast.success(`Marked ${w.id} as Paid`); }}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 text-xs font-semibold hover:bg-emerald-500/25 disabled:opacity-30"
                      >
                        <Check size={12} /> Mark Paid
                      </button>
                      <button
                        disabled={w.status !== "Pending"}
                        onClick={() => { rejectWithdrawal(w.id); toast.error(`Refunded ${w.id}`); }}
                        className="inline-flex items-center gap-1 rounded-md bg-red-500/15 text-red-300 border border-red-500/30 px-2.5 py-1 text-xs font-semibold hover:bg-red-500/25 disabled:opacity-30"
                      >
                        <X size={12} /> Refund
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-sm text-slate-500">No withdrawals to display</td></tr>
              )}
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
    Paid: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    Rejected: "bg-red-500/15 text-red-300 border-red-500/30",
  };
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${map[status] || ""}`}>{status}</span>;
}
