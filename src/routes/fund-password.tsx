import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { PageHeader } from "@/components/PageHeader";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export const Route = createFileRoute("/fund-password")({
  component: () => (<AuthGate><FundPwd /></AuthGate>),
});

function FundPwd() {
  const { user, updateUser } = useApp();
  const nav = useNavigate();
  const [pwd, setPwd] = useState("");
  const [conf, setConf] = useState("");

  if (!user) return null;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd.length !== 6) return toast.error("PIN must be 6 digits");
    if (pwd !== conf) return toast.error("PINs do not match");
    updateUser({ fundPassword: pwd });
    toast.success("Fund password saved");
    nav({ to: "/account" });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-app-gradient pb-16">
      <PageHeader title="Fund Password" />

      <div className="-mt-4 px-5">
        <form onSubmit={save} className="rounded-2xl bg-card p-5 shadow-elevated space-y-4">
          <p className="text-xs text-muted-foreground">
            {user.fundPassword ? "Update your 6-digit fund password." : "Set a 6-digit PIN for withdrawals."}
          </p>
          <Pin label="New PIN" value={pwd} onChange={setPwd} />
          <Pin label="Confirm PIN" value={conf} onChange={setConf} />
          <button type="submit" className="w-full rounded-full bg-primary-gradient py-3.5 text-base font-bold text-white shadow-elevated active:scale-[0.98] transition-transform">
            Save Fund Password
          </button>
        </form>
      </div>
    </div>
  );
}

function Pin({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input
        type="password" inputMode="numeric" maxLength={6}
        value={value} onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="••••••"
        className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base tracking-[0.5em] outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
