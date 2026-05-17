import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { ChevronLeft, Smartphone, Lock, Eye, EyeOff, Check, Headphones } from "lucide-react";
import bg from "@/assets/asm-login-bg.jpg";
import logo from "@/assets/gic-logo.png";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !password) return toast.error("Enter phone and password");
    setBusy(true);
    const r = await login(phone, password);
    setBusy(false);
    if (r.ok) { toast.success("Welcome back!"); nav({ to: "/home" }); }
    else toast.error(r.msg || "Invalid credentials");
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden">
      <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/30 via-sky-400/20 to-sky-500/40" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-4 pb-10">
        <div className="flex items-center justify-between">
          <button onClick={() => history.back()} className="p-2 -ml-2 text-slate-800/80">
            <ChevronLeft size={26} />
          </button>
          <button className="text-base text-slate-800/80">Language</button>
        </div>

        <img src={logo} alt="GIC" className="mt-6 mx-auto h-20 object-contain" />

        <form onSubmit={submit} className="mt-16 space-y-4">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm">
            <Smartphone size={20} className="text-sky-500" />
            <span className="text-slate-700">+591</span>
            <span className="h-4 w-px bg-slate-200" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Please enter your phone number"
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm">
            <Lock size={20} className="text-slate-700" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Please enter the login password"
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="text-slate-400">
              {show ? <Eye size={20} /> : <EyeOff size={20} />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setRemember((v) => !v)}
            className="flex items-center gap-2 text-slate-800"
          >
            <span className={`flex h-5 w-5 items-center justify-center rounded-full ${remember ? "bg-red-500" : "bg-white border border-slate-300"}`}>
              {remember && <Check size={14} className="text-white" strokeWidth={3} />}
            </span>
            <span className="text-sm">Remember username/password</span>
          </button>

          <button
            type="submit"
            disabled={busy}
            className="mt-4 w-full rounded-full bg-sky-400 py-4 text-lg font-medium text-white shadow-md active:scale-[0.99] transition disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Log in now"}
          </button>

          <Link
            to="/register"
            className="block w-full rounded-full bg-white py-4 text-center text-lg font-medium text-slate-800 shadow-md"
          >
            Register now
          </Link>
        </form>

        <div className="flex-1" />
      </div>

      <a
        href="https://t.me/globalsuuport2"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-4 z-20 flex flex-col items-center"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 shadow-lg">
          <Headphones className="text-white" size={26} />
        </div>
        <span className="mt-1 text-xs font-bold text-slate-900 leading-tight text-center">Online<br />Service</span>
      </a>
    </div>
  );
}
