import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Copy, Users, Wallet, DollarSign, Gift } from "lucide-react";

export const Route = createFileRoute("/invite")({
  component: () => (<AuthGate><Invite /></AuthGate>),
});

function Invite() {
  const { user } = useApp();
  // Generate a fresh random code on mount as requested, but fall back to user's code
  const code = useMemo(() => Math.floor(100000 + Math.random() * 900000).toString(), []);
  const displayCode = user?.myCode || code;
  const origin = typeof window !== "undefined"
    ? window.location.origin
    : "https://earn-flow-bot.lovable.app";
  const fullLink = `${origin}/register?code=${displayCode}`;
  const link = fullLink.replace(/^https?:\/\//, "");

  const copy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`Success! ${label} copied to clipboard`);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-gradient-to-b from-[oklch(0.5_0.2_255)] via-[oklch(0.7_0.16_200)] to-white pb-16">
      <PageHeader title="Invite Friends" />

      {/* Hero gift */}
      <div className="px-6 pt-2 pb-6 text-center text-white">
        <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-white/10 backdrop-blur-md shadow-glow">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gold-gradient shadow-elevated">
            <Gift size={48} className="text-white drop-shadow-md" />
          </div>
        </div>
        <h2 className="mt-5 text-2xl font-black">Earn Together</h2>
        <p className="mt-1 text-sm text-white/85">Invite friends and earn lifetime commissions</p>
      </div>

      <div className="px-5 space-y-4">
        {/* Invitation Code */}
        <div className="rounded-2xl bg-card p-5 shadow-elevated">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">My Invitation Code</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-3xl font-black tracking-[0.25em] text-foreground">{displayCode}</p>
            <button
              onClick={() => copy(displayCode, "Code")}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-2 text-xs font-bold text-secondary-foreground active:scale-95 transition-transform"
            >
              <Copy size={14} /> Copy
            </button>
          </div>
        </div>

        {/* Referral Link */}
        <div className="rounded-2xl bg-card p-5 shadow-elevated">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Referral Link</p>
          <p className="mt-2 truncate text-sm font-medium text-foreground">{link}</p>
          <button
            onClick={() => copy(fullLink, "Link")}
            className="mt-3 w-full rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-fuchsia-600 py-3 text-sm font-bold text-white shadow-elevated active:scale-[0.98] transition-transform"
          >
            Copy Invitation Link
          </button>
        </div>

        {/* Reward steps */}
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm font-bold">Referral Rewards</p>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <Step icon={Users} label="Invite Friends" />
            <Arrow />
            <Step icon={Wallet} label="They Invest" />
          </div>
          <div className="mt-3 flex justify-center">
            <Step icon={DollarSign} label="Get Commission" highlight />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Earn up to <span className="font-bold text-[var(--blue-brand)]">10%</span> commission from your Level A team deposits.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({ icon: Icon, label, highlight }: { icon: any; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={`flex h-12 w-12 items-center justify-center rounded-full text-white shadow-md ${highlight ? "bg-gold-gradient" : "bg-primary-gradient"}`}>
        <Icon size={20} />
      </span>
      <span className="text-[11px] font-medium">{label}</span>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center justify-center">
      <span className="text-xl text-muted-foreground">→</span>
    </div>
  );
}
