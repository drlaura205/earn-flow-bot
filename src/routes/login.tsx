import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Phone, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error("Enter phone and password");
    setBusy(true);
    const r = await login(phone, password);
    setBusy(false);
    if (r.ok) {
      toast.success("Welcome back!");
      nav({ to: "/home" });
    } else {
      toast.error(r.msg || "Invalid credentials");
    }
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-hero-gradient">
      <div className="px-6 pt-16 pb-10 text-white">
        <div className="mb-2 inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/15 backdrop-blur-sm shadow-glow">
          <span className="text-2xl font-black">G</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight">Welcome Back</h1>
        <p className="mt-1 text-white/80">Sign in to Global Investment Company</p>
      </div>

      <div className="rounded-t-3xl bg-card px-6 pt-8 pb-12 shadow-elevated min-h-[60vh]">
        <form onSubmit={submit} className="space-y-4">
          <Field icon={Phone} label="Phone Number" value={phone} onChange={setPhone} placeholder="+1 555 000 0000" />
          <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 py-3.5 text-base font-bold text-white shadow-elevated active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-[var(--blue-brand)]">Register</Link>
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
