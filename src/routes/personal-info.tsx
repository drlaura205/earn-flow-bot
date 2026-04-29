import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export const Route = createFileRoute("/personal-info")({
  component: () => (<AuthGate><PersonalInfo /></AuthGate>),
});

function PersonalInfo() {
  const { user, updateUser } = useApp();
  const nav = useNavigate();
  const [addr, setAddr] = useState(user?.walletAddress || "");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr)) {
      return toast.error("Invalid TRC-20 address. Must start with T and be 34 chars.");
    }
    updateUser({ walletAddress: addr });
    toast.success("USDT wallet address saved");
    nav({ to: "/account" });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-app-gradient pb-16">
      <PageHeader title="USDT Wallet Address" />

      <div className="-mt-4 px-5">
        <form onSubmit={save} className="rounded-2xl bg-card p-5 shadow-elevated space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">USDT (TRC-20) Address</label>
            <input
              value={addr} onChange={(e) => setAddr(e.target.value.trim())}
              placeholder="T..."
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-2 text-[11px] text-muted-foreground">
              Must be a valid 34-character TRON address starting with T. Withdrawals will be sent here on the TRON network.
            </p>
          </div>

          <button type="submit" className="w-full rounded-full bg-primary-gradient py-3.5 text-base font-bold text-white shadow-elevated active:scale-[0.98] transition-transform">
            Save Address
          </button>
        </form>
      </div>
    </div>
  );
}
