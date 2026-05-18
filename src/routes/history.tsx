import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft } from "lucide-react";

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

function formatRef(id: string, created_at: string) {
  // Build a numeric-looking ref like 20251028090945xxxxx...
  const d = new Date(created_at);
  const pad = (n: number, l = 2) => String(n).padStart(l, "0");
  const head =
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) + pad(d.getDate()) +
    pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  const tail = id.replace(/\D/g, "").padEnd(6, "0").slice(0, 6);
  return `${head}${tail}…`;
}

function formatDate(s: string) {
  const d = new Date(s);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function statusLabel(s: string, kind: "d" | "w") {
  if (kind === "w") {
    if (s === "Approved" || s === "Paid" || s === "Completed") return "Paid";
    if (s === "Rejected") return "Rejected";
    return "Pending";
  }
  if (s === "Approved" || s === "Completed" || s === "Paid") return "Completed";
  if (s === "Rejected") return "Rejected";
  return "Pending";
}

function History() {
  const { user } = useApp();
  const navigate = useNavigate();
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

  const mainBalance = Number(user.balance || 0);
  const commission = Number(user.referralRewards || 0);

  const list = tab === "deposits"
    ? deposits.map((d) => ({
        key: d.id,
        ref: formatRef(d.id, d.created_at),
        amount: Number(d.amount),
        date: formatDate(d.created_at),
        status: statusLabel(d.status, "d"),
      }))
    : withdrawals.map((w) => ({
        key: w.id,
        ref: formatRef(w.id, w.created_at),
        amount: Number(w.amount),
        date: formatDate(w.created_at),
        status: statusLabel(w.status, "w"),
      }));

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-gradient-to-br from-sky-100 via-rose-50 to-rose-100 pb-16">
      {/* Header */}
      <div className="relative flex items-center bg-white px-4 py-3.5">
        <button onClick={() => navigate({ to: "/account" })}>
          <ChevronLeft size={26} className="text-slate-500" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-slate-900">
          My wallet
        </h1>
      </div>

      {/* Balance + Actions card */}
      <div className="px-4 pt-3">
        <div className="rounded-2xl bg-slate-400/60 backdrop-blur-sm p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <p className="text-3xl font-black text-blue-700 tracking-tight">
                {mainBalance.toFixed(4)}
              </p>
              <p className="mt-1 text-sm text-slate-100">Main Wallet</p>
            </div>
            <div>
              <p className="text-3xl font-black text-blue-700 tracking-tight">
                {commission.toFixed(4)}
              </p>
              <p className="mt-1 text-sm text-slate-100">Commission Wallet</p>
            </div>
          </div>
          <div className="mt-3 border-t border-white/40" />
          <div className="grid grid-cols-2 mt-3 text-center text-base font-bold">
            <Link to="/recharge" className="text-yellow-300 hover:opacity-90">
              Recharge
            </Link>
            <Link to="/withdraw" className="text-white hover:opacity-90 border-l border-white/40">
              Withdrawal
            </Link>
          </div>
        </div>
      </div>

      {/* Sub tabs */}
      <div className="mt-4 grid grid-cols-2 bg-slate-300/30 backdrop-blur-sm">
        {(["deposits", "withdrawals"] as const).map((t) => {
          const active = tab === t;
          const label = t === "deposits" ? "Recharge record" : "Withdrawal record";
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative py-3 text-center text-[15px] font-semibold"
            >
              <span className={active ? "text-blue-700 font-bold" : "text-slate-500"}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-1.5 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full bg-blue-700" />
              )}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="px-3 mt-3 space-y-2.5">
        {loading && (
          <p className="text-center text-sm text-slate-500 py-10">Loading…</p>
        )}

        {!loading && list.length === 0 && (
          <p className="text-center text-sm text-slate-400 py-10">No more data</p>
        )}

        {!loading && list.map((row) => (
          <div
            key={row.key}
            className="rounded-2xl bg-slate-400/40 backdrop-blur-sm px-4 py-3 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-medium text-white truncate">{row.ref}</p>
              <p className="text-[15px] font-medium text-white whitespace-nowrap">{row.date}</p>
            </div>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-2xl font-bold text-cyan-300">
                {row.amount.toFixed(2)}
              </p>
              <p className="text-base text-white">{row.status}</p>
            </div>
          </div>
        ))}

        {!loading && list.length > 0 && (
          <p className="text-center text-xs text-slate-400 py-4">No more data</p>
        )}
      </div>
    </div>
  );
}
