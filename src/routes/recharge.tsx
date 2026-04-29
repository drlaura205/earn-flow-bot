import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/recharge")({
  component: () => (<AuthGate><Recharge /></AuthGate>),
});

function Recharge() {
  const { user, submitDeposit } = useApp();
  const [copied, setCopied] = useState(false);
  const [address, setAddress] = useState("TJRabPrwbZy45sbavfcjinPJC18kjpRTv8");
  const [amount, setAmount] = useState("");
  const [txid, setTxid] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("deposit_address").eq("id", 1).maybeSingle()
      .then(({ data }) => { if (data?.deposit_address) setAddress(data.deposit_address); });
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return toast.error("Enter a valid amount");
    if (txid.trim().length < 6) return toast.error("Enter the transaction ID (TXID)");
    setBusy(true);
    const r = await submitDeposit(n, txid.trim());
    setBusy(false);
    if (r.ok) {
      toast.success(r.msg);
      setAmount(""); setTxid("");
    } else toast.error(r.msg);
  };

  if (!user) return null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-app-gradient pb-12">
      <PageHeader title="Recharge USDT" />

      <div className="-mt-4 px-5 space-y-4">
        <div className="rounded-2xl bg-card p-6 shadow-elevated text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Network</p>
          <p className="mt-1 text-base font-bold text-[var(--blue-brand)]">USDT — TRC20 (TRON Network)</p>

          <div className="mx-auto mt-5 inline-block rounded-2xl bg-white p-4 shadow-md ring-1 ring-border">
            <QRCodeSVG value={address} size={180} />
          </div>

          <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">Deposit Address</p>
          <p className="mt-1 break-all rounded-lg bg-secondary px-3 py-2 text-xs font-mono">{address}</p>

          <button onClick={copy} className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-white shadow-elevated active:scale-95 transition-transform">
            <Copy size={16} /> {copied ? "Copied!" : "Copy Address"}
          </button>
        </div>

        <form onSubmit={submit} className="rounded-2xl bg-card p-5 shadow-card space-y-3">
          <h3 className="text-sm font-bold">Submit Your Deposit</h3>
          <p className="text-[11px] text-muted-foreground">After sending USDT to the address above, paste your TXID below for admin review.</p>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Amount (USDT)</label>
            <input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none focus:ring-2 focus:ring-ring" placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-muted-foreground">Transaction Hash (TXID)</label>
            <input value={txid} onChange={(e) => setTxid(e.target.value)}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring" placeholder="0x..." />
          </div>
          <button type="submit" disabled={busy} className="w-full rounded-full bg-primary-gradient py-3 text-sm font-bold text-white shadow-md active:scale-[0.98] disabled:opacity-60">
            {busy ? "Submitting…" : "Submit for Review"}
          </button>
        </form>

        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            <p className="text-sm font-bold">Warning</p>
          </div>
          <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
            <li>Send only USDT via TRC-20 (TRON) network. Other networks will result in permanent loss.</li>
            <li>Funds are credited after admin reviews your TXID.</li>
            <li>Contact support if your deposit isn't credited within 30 minutes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
