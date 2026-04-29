import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";
import {
  MIN_WITHDRAWAL,
  WITHDRAWAL_FEE_RATE,
  calcWithdrawal,
  isWithdrawWindowOpen,
  ukClockLabel,
} from "@/lib/withdrawWindow";

export const Route = createFileRoute("/withdraw")({
  component: () => (<AuthGate><Withdraw /></AuthGate>),
});

const PRESETS = [10, 25, 50, 100, 250, 500];

function Withdraw() {
  const { user, withdraw } = useApp();
  const nav = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [pwd, setPwd] = useState("");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  if (!user) return null;

  const open = isWithdrawWindowOpen(now);
  const clock = ukClockLabel(now);
  const n = parseFloat(amount) || 0;
  const { fee, net } = calcWithdrawal(n);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(n) || n <= 0) return toast.error("Enter a valid amount");
    if (pwd.length !== 6) return toast.error("Fund password must be 6 digits");
    const r = withdraw(n, pwd);
    if (r.ok) {
      toast.success(r.msg);
      nav({ to: "/account" });
    } else {
      toast.error(r.msg);
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-app-gradient pb-16">
      <PageHeader title="Withdraw USDT" />

      <div className="-mt-4 px-5 space-y-4">
        {/* Status / Network strip */}
        <div className="rounded-2xl bg-card p-4 shadow-card flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-muted-foreground" />
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Network</p>
              <p className="text-sm font-bold">USDT-TRC20</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${open ? "bg-emerald-500/15 text-emerald-600" : "bg-red-500/15 text-red-600"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${open ? "bg-emerald-500" : "bg-red-500"}`} />
              {open ? "Open" : "Closed"}
            </span>
            <p className="mt-1 text-[10px] text-muted-foreground">{clock}</p>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-5 shadow-elevated">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Available Balance</p>
          <p className="mt-1 text-3xl font-black">${user.balance.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Wallet: {user.walletAddress
              ? user.walletAddress.slice(0,10) + "…" + user.walletAddress.slice(-6)
              : <span className="text-destructive font-semibold">Not set</span>}
          </p>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-card p-5 shadow-card space-y-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Amount</p>
            <div className="grid grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(String(p))}
                  className={`rounded-lg border py-2 text-sm font-bold transition ${amount === String(p) ? "border-transparent bg-primary-gradient text-white shadow-md" : "border-border bg-background text-foreground"}`}
                >
                  ${p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Withdrawal Amount (min ${MIN_WITHDRAWAL})
            </label>
            <input
              type="number" step="0.01" min={MIN_WITHDRAWAL}
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Fee breakdown */}
          <div className="rounded-xl border border-border bg-background/60 p-3 space-y-1.5 text-sm">
            <Row label="Amount" value={`$${n.toFixed(2)}`} />
            <Row label={`Handling Fee (${WITHDRAWAL_FEE_RATE * 100}%)`} value={`-$${fee.toFixed(2)}`} valueClass="text-destructive" />
            <div className="border-t border-border pt-1.5">
              <Row label="You receive" value={`$${Math.max(0, net).toFixed(2)}`} valueClass="font-black text-emerald-600" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fund Password (6 digits)</label>
            <input
              type="password" inputMode="numeric" maxLength={6}
              value={pwd} onChange={(e) => setPwd(e.target.value.replace(/\D/g, ""))}
              placeholder="••••••"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base tracking-[0.5em] outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={!open}
            className="w-full rounded-full bg-primary-gradient py-3.5 text-base font-bold text-white shadow-elevated active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            {open ? "Submit Withdrawal" : "Withdrawals Closed"}
          </button>

          <p className="text-center text-[11px] text-muted-foreground">
            Open: Mon–Sat, 09:00–20:00 UK time · Processing 1–48 hours
          </p>
        </form>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            <p className="text-sm font-bold">Warning</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Please ensure you are using the <span className="font-bold text-foreground">TRON (TRC-20)</span> network.
            Transfers to BEP-20 or ERC-20 addresses will result in permanent loss of funds.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}
