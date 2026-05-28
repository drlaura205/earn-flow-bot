import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  const { login } = useAdmin();
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const ok = await login(u, p);
      if (ok) {
        toast.success("Welcome, Admin");
        nav({ to: "/admin/dashboard" });
      } else toast.error("Invalid credentials");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)" }}>
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="h-14 w-14 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mb-3">
            <ShieldCheck className="text-cyan-400" size={26} />
          </div>
          <h1 className="text-xl font-bold text-slate-100">GIC Admin Console</h1>
          <p className="text-xs text-slate-400 mt-1">Authorized personnel only</p>
        </div>
        <div className="space-y-3">
          <input value={u} onChange={(e) => setU(e.target.value)} placeholder="Username" autoComplete="username"
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500" />
          <input value={p} onChange={(e) => setP(e.target.value)} type="password" placeholder="Password" autoComplete="current-password"
            className="w-full rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500" />
          <button disabled={busy} className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-lg active:scale-[0.98] transition disabled:opacity-50">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </div>
        <p className="mt-6 text-[11px] text-center text-slate-500">Authorized personnel only.</p>
      </form>
    </div>
  );
}
