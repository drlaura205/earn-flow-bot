import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Copy, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/recharge")({
  component: () => (
    <AuthGate><Recharge /></AuthGate>
  ),
});

const ADMIN_BEP20 = "0x9F8d2A4E7b3C1d56789aBcDeF0123456789Abcde";

function Recharge() {
  const { user } = useApp();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(ADMIN_BEP20);
    setCopied(true);
    toast.success("Address copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-app-gradient pb-12">
      <PageHeader title="Recharge USDT" />

      <div className="-mt-4 px-5">
        <div className="rounded-2xl bg-card p-6 shadow-elevated text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Network</p>
          <p className="mt-1 text-base font-bold text-[var(--blue-brand)]">USDT — BEP20 (Binance Smart Chain)</p>

          <div className="mx-auto mt-5 inline-block rounded-2xl bg-white p-4 shadow-md ring-1 ring-border">
            <QRCodeSVG value={ADMIN_BEP20} size={180} />
          </div>

          <p className="mt-5 text-xs uppercase tracking-widest text-muted-foreground">Deposit Address</p>
          <p className="mt-1 break-all rounded-lg bg-secondary px-3 py-2 text-xs font-mono">{ADMIN_BEP20}</p>

          <button
            onClick={copy}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary-gradient px-6 py-3 text-sm font-bold text-white shadow-elevated active:scale-95 transition-transform"
          >
            <Copy size={16} /> {copied ? "Copied!" : "Copy Address"}
          </button>

          <button
            onClick={() => toast.error("Save QR Code by long-pressing the image.")}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full bg-destructive px-6 py-3 text-sm font-bold text-white shadow-md active:scale-95 transition-transform"
          >
            Save QR Code
          </button>
        </div>

        <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle size={18} />
            <p className="text-sm font-bold">Warning</p>
          </div>
          <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground space-y-1">
            <li>Send only USDT via BEP-20 (BSC) network. Other networks will result in permanent loss.</li>
            <li>Funds are credited after 1 network confirmation.</li>
            <li>Contact support if your deposit isn't credited within 30 minutes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
