import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

export const Route = createFileRoute("/history")({
  component: () => (<AuthGate><History /></AuthGate>),
});

interface Deposit {
  id: string; amount: number; status: string; txid: string | null;
  network: string; created_at: string;
}
interface Withdrawal {
  id: string; amount: number; fee: number; net_amount: number;
  status: string; address: string; network: string; created_at: string;
}

function statusClass(s: string) {
  if (s === "Approved" || s === "Paid") return "bg-emerald-500/10 text-emerald-600";
  if (s === "Rejected") return "bg-destructive/10 text-destructive";
  return "bg-amber-500/10 text-amber-600";
}

function History() {
  const { user } = useApp();
  const [tab, setTab] = useState<"deposits" | "withdrawals">("deposits");
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [d, w] = await Promise.all([
        supabase.from("deposits").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("withdrawals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);
      if (cancelled) return;
      setDeposits((d.data as Deposit[]) || []);
      setWithdrawals((w.data as Withdrawal[]) || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  if (!user) return null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-app-gradient pb-16">
      <PageHeader title="Transaction History" />

      <div className="px-5 -mt-4">
        <div className="grid grid-cols-2 rounded-full bg-card p-1 shadow-card">
          <button
            onClick={() => setTab("deposits")}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-bold transition-colors ${tab === "deposits" ? "bg-primary-gradient text-white" : "text-muted-foreground"}`}
          >
            <ArrowDownToLine size={14} /> Deposits
          </button>
          <button
            onClick={() => setTab("withdrawals")}
            className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-bold transition-colors ${tab === "withdrawals" ? "bg-primary-gradient text-white" : "text-muted-foreground"}`}
          >
            <ArrowUpFromLine size={14} /> Withdrawals
          </button>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        {loading && <p className="text-center text-sm text-muted-foreground py-10">Loading…</p>}

        {!loading && tab === "deposits" && deposits.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No deposits yet.</p>
        )}
        {!loading && tab === "deposits" && deposits.map((d) => (
          <div key={d.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-lg font-black">+${Number(d.amount).toFixed(2)}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusClass(d.status)}`}>{d.status}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{new Date(d.created_at).toLocaleString()} • {d.network}</p>
            {d.txid && <p className="mt-1 text-[11px] font-mono text-muted-foreground break-all">TXID: {d.txid}</p>}
          </div>
        ))}

        {!loading && tab === "withdrawals" && withdrawals.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">No withdrawals yet.</p>
        )}
        {!loading && tab === "withdrawals" && withdrawals.map((w) => (
          <div key={w.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-lg font-black">-${Number(w.amount).toFixed(2)}</p>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusClass(w.status)}`}>{w.status}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Fee: ${Number(w.fee).toFixed(2)}</span>
              <span>Net: ${Number(w.net_amount).toFixed(2)}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{new Date(w.created_at).toLocaleString()} • {w.network}</p>
            <p className="mt-1 text-[11px] font-mono text-muted-foreground break-all">To: {w.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
