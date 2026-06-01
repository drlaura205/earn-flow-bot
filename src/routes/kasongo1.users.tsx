import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, Minus, Ban, ShieldCheck, Wallet, WalletMinimal, KeyRound } from "lucide-react";
import { AdminGate } from "@/components/AdminLayout";
import { useAdmin, AdminTier } from "@/context/AdminContext";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { adminResetUserPassword } from "@/lib/admin.functions";

export const Route = createFileRoute("/kasongo1/users")({
  component: () => (<AdminGate><UsersPage /></AdminGate>),
});

const TIERS: AdminTier[] = ["Intern", "C1", "C2", "C3", "C4", "C5"];

function UsersPage() {
  const { users, adjustBalance, adjustCommission, setUserTier, toggleSuspend, toggleWithdraw } = useAdmin();
  const resetPassword = useServerFn(adminResetUserPassword);
  const [q, setQ] = useState("");
  const filtered = users.filter((u) => u.id.toLowerCase().includes(q.toLowerCase()) || u.phone.toLowerCase().includes(q.toLowerCase()));

  const handleResetPassword = async (userId: string, phone: string) => {
    const pwd = window.prompt(`Enter NEW password for ${phone} (min 6 chars):`, "");
    if (!pwd) return;
    if (pwd.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (!window.confirm(`Reset password for ${phone}? This will immediately change their login password.`)) return;
    try {
      await resetPassword({ data: { userId, newPassword: pwd } });
      toast.success(`Password reset for ${phone}`);
    } catch (e: any) {
      toast.error(e?.message || "Failed to reset password");
    }
  };

  const adjust = (id: string, sign: 1 | -1, kind: "main" | "commission") => {
    const v = window.prompt(`${sign === 1 ? "Add" : "Subtract"} ${kind} balance (USDT):`, "10");
    const n = parseFloat(v || "");
    if (!isNaN(n) && n > 0) {
      if (kind === "main") adjustBalance(id, sign * n);
      else adjustCommission(id, sign * n);
      toast.success(`${sign === 1 ? "Added" : "Subtracted"} $${n} (${kind}) for ${id}`);
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">User Management</h1>
          <p className="text-sm text-slate-400 mt-1">CRM, balance adjustments, tier & status control</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID or phone…"
            className="w-64 rounded-lg bg-slate-800/60 border border-slate-700 pl-9 pr-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500" />
        </div>
      </header>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-900/80">
              <tr>
                <th className="text-left py-3 px-4">User ID</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Main</th>
                <th className="text-left py-3 px-4">Commission</th>
                <th className="text-left py-3 px-4">Tier</th>
                <th className="text-left py-3 px-4">Upline</th>
                <th className="text-left py-3 px-4">Joined</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Withdraw</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-slate-800/60 hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-mono text-xs">{u.id}</td>
                  <td className="py-3 px-4 text-slate-300">{u.phone}</td>
                  <td className="py-3 px-4 font-bold text-cyan-300">${u.mainBalance.toFixed(2)}</td>
                  <td className="py-3 px-4 font-bold text-amber-300">${u.commissionBalance.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <select value={u.tier} onChange={(e) => { setUserTier(u.id, e.target.value as AdminTier); toast.success(`Tier updated for ${u.id}`); }}
                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs">
                      {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-slate-400">{u.upline}</td>
                  <td className="py-3 px-4 text-xs text-slate-400">{u.joined}</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${u.status === "Active" ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-red-500/15 text-red-300 border-red-500/30"}`}>{u.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${u.withdrawEnabled ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-slate-500/15 text-slate-300 border-slate-500/30"}`}>{u.withdrawEnabled ? "Enabled" : "Disabled"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => adjust(u.id, 1, "main")} title="Add to main" className="p-1.5 rounded bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"><Plus size={12} /></button>
                      <button onClick={() => adjust(u.id, -1, "main")} title="Subtract from main" className="p-1.5 rounded bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"><Minus size={12} /></button>
                      <button onClick={() => adjust(u.id, 1, "commission")} title="Add to commission" className="p-1.5 rounded bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 border border-amber-500/30"><Plus size={12} /></button>
                      <button onClick={() => adjust(u.id, -1, "commission")} title="Subtract from commission" className="p-1.5 rounded bg-amber-500/15 text-amber-200 hover:bg-amber-500/25 border border-amber-500/30"><Minus size={12} /></button>
                      <button onClick={() => { toggleWithdraw(u.id); toast.success(`Withdraw ${u.withdrawEnabled ? "disabled" : "enabled"} for ${u.phone}`); }} title={u.withdrawEnabled ? "Disable withdrawals" : "Enable withdrawals"}
                        className={`p-1.5 rounded ${u.withdrawEnabled ? "bg-slate-500/15 text-slate-300 hover:bg-slate-500/25" : "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"}`}>
                        {u.withdrawEnabled ? <WalletMinimal size={12} /> : <Wallet size={12} />}
                      </button>
                      <button onClick={() => { toggleSuspend(u.id); toast.success(`Status toggled for ${u.id}`); }} title="Suspend / Activate"
                        className={`p-1.5 rounded ${u.status === "Active" ? "bg-red-500/15 text-red-300 hover:bg-red-500/25" : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25"}`}>
                        {u.status === "Active" ? <Ban size={12} /> : <ShieldCheck size={12} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="py-12 text-center text-sm text-slate-500">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
