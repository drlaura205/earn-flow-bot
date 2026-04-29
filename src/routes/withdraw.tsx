import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/withdraw")({
  component: () => (<AuthGate><Withdraw /></AuthGate>),
});

const PRESETS = [10, 25, 50, 100, 250, 500];

function Withdraw() {
  const { user, withdraw } = useApp();
  const nav = useNavigate();
  const [amount, setAmount] = useState<string>("");
  const [pwd, setPwd] = useState("");

  if (!user) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (isNaN(n)) return toast.error("Enter a valid amount");
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
        <div className="rounded-2xl bg-card p-5 shadow-elevated">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Available Balance</p>
          <p className="mt-1 text-3xl font-black">${user.balance.toFixed(2)}</p>
          <p className="mt-1 text-xs text-muted-foreground">Wallet: {user.walletAddress ? user.walletAddress.slice(0,10) + "…" + user.walletAddress.slice(-6) : <span className="text-destructive font-semibold">Not set</span>}</p>
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
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Withdrawal Amount (min $1)</label>
            <input
              type="number" step="0.01" min="1"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring"
            />
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

          <button type="submit" className="w-full rounded-full bg-primary-gradient py-3.5 text-base font-bold text-white shadow-elevated active:scale-[0.98] transition-transform">
            Submit Withdrawal
          </button>
        </form>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            <p className="text-sm font-bold">Warning</p>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Withdrawals are processed to your saved TRC-20 USDT wallet. Network fees may apply.
          </p>
        </div>
      </div>
    </div>
  );
}
