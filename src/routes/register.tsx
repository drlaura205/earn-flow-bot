import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Phone, Lock, Ticket } from "lucide-react";

export const Route = createFileRoute("/register")({
  component: Register,
});

function Register() {
  const { register } = useApp();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error("Phone number required");
    if (password.length < 6) return toast.error("Password must be 6+ characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    if (!code) return toast.error("Invitation code required");
    register({ phone, password, invitationCode: code });
    toast.success("Account created! $5 welcome bonus added.");
    nav({ to: "/home" });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-hero-gradient">
      <div className="px-6 pt-12 pb-8 text-white">
        <h1 className="text-3xl font-black tracking-tight">Create Account</h1>
        <p className="mt-1 text-white/80">Get a $5 welcome bonus instantly</p>
      </div>

      <div className="rounded-t-3xl bg-card px-6 pt-8 pb-12 shadow-elevated min-h-[70vh]">
        <form onSubmit={submit} className="space-y-4">
          <Field icon={Phone} label="Phone Number" value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
          <Field icon={Lock} label="Login Password" type="password" value={password} onChange={setPassword} placeholder="At least 6 chars" />
          <Field icon={Lock} label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Re-enter password" />
          <Field icon={Ticket} label="Invitation Code" value={code} onChange={setCode} placeholder="Enter referral code" />

          <button
            type="submit"
            className="mt-2 w-full rounded-full bg-primary-gradient py-3.5 text-base font-bold text-white shadow-elevated active:scale-[0.98] transition-transform"
          >
            Register & Claim $5
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[var(--blue-brand)]">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, value, onChange, type = "text", placeholder,
}: { icon: any; label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-input bg-background px-4 py-3 focus-within:ring-2 focus-within:ring-ring">
        <Icon size={18} className="text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-base outline-none"
        />
      </div>
    </label>
  );
}
