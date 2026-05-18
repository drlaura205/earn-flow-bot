import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { useLang } from "@/context/LanguageContext";
import { LanguageMenu } from "@/components/LanguageMenu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChevronLeft, Smartphone, Lock, ShieldCheck, Heart, Headphones } from "lucide-react";
import bg from "@/assets/asm-login-bg.jpg";
import logo from "@/assets/gic-logo.png";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const { register, login } = useApp();
  const { t } = useLang();
  const nav = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [verify, setVerify] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  const captcha = useMemo(() => String(Math.floor(1000 + Math.random() * 9000)), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const c = new URLSearchParams(window.location.search).get("code");
    if (c) setCode(c);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return toast.error("Phone number required");
    if (password.length < 6) return toast.error("Password must be 6+ characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    if (verify !== captcha) return toast.error("Verification code is incorrect");
    if (!code) return toast.error("Invitation code required");
    setBusy(true);
    const { data: validCode, error: vErr } = await supabase.rpc("validate_invite_code", { _code: code.trim() });
    if (vErr || !validCode) {
      setBusy(false);
      return toast.error("Invalid invitation code");
    }
    const r = await register({ phone, password, invitationCode: code.trim() });
    if (!r.ok) { setBusy(false); return toast.error(r.msg); }
    const l = await login(phone, password);
    setBusy(false);
    if (l.ok) { toast.success("Account created!"); nav({ to: "/home" }); }
    else { toast.success("Account created. Please log in."); nav({ to: "/login" }); }
  };

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden">
      <img src={bg} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/30 via-sky-400/20 to-sky-500/40" />

      <div className="relative z-10 flex min-h-screen flex-col px-6 pt-4 pb-10">
        <div className="flex items-center justify-between">
          <Link to="/login" className="p-2 -ml-2 text-slate-800/80">
            <ChevronLeft size={26} />
          </Link>
          <LanguageMenu />
        </div>

        <img src={logo} alt="GIC" className="mt-6 mx-auto h-20 object-contain" />

        <form onSubmit={submit} className="mt-10 space-y-3">
          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm">
            <Smartphone size={20} className="text-sky-500" />
            <span className="text-slate-700">+591</span>
            <span className="h-4 w-px bg-slate-200" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("phone_ph")}
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-500" />
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm">
            <Lock size={20} className="text-slate-700" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("password_ph")}
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-500" />
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm">
            <Lock size={20} className="text-slate-700" />
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t("confirm_ph")}
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-500" />
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm">
            <ShieldCheck size={20} className="text-sky-500" />
            <input value={verify} onChange={(e) => setVerify(e.target.value)} placeholder={t("captcha_ph")}
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-500" />
            <span className="text-slate-700 font-medium tracking-widest">{captcha}</span>
          </div>

          <div className="flex items-center gap-3 rounded-full bg-white px-5 py-4 shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">
              <Heart size={14} className="text-rose-400 fill-rose-400" />
            </span>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("invite_ph")}
              className="w-full bg-transparent text-base outline-none placeholder:text-slate-500" />
          </div>

          <button type="submit" disabled={busy}
            className="mt-4 w-full rounded-full bg-sky-400 py-4 text-lg font-medium text-white shadow-md active:scale-[0.99] transition disabled:opacity-60">
            {busy ? t("creating") : t("register_now")}
          </button>

          <button type="button"
            className="w-full rounded-full bg-white py-4 text-lg font-medium text-slate-800 shadow-md">
            {t("download_app")}
          </button>

          <p className="pt-2 text-sm text-white">
            {t("have_account")}{" "}
            <Link to="/login" className="text-blue-700 font-medium">{t("login")}</Link>
          </p>
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
