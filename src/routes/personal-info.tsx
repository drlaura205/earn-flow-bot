import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Headphones } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";

export const Route = createFileRoute("/personal-info")({
  component: () => (<AuthGate><PersonalInfo /></AuthGate>),
});

function PersonalInfo() {
  const { user, logout } = useApp();
  const nav = useNavigate();
  if (!user) return null;

  const phoneDigits = user.phone.replace(/\D/g, "").replace(/^591/, "");

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="relative bg-white px-4 pt-12 pb-4 border-b border-slate-100">
        <button onClick={() => nav({ to: "/account" })} className="absolute left-3 top-12 flex h-9 w-9 items-center justify-center">
          <ChevronLeft size={24} className="text-slate-500" />
        </button>
        <h1 className="text-center text-lg font-bold text-slate-800">Personal information</h1>
      </div>

      <div className="flex-1 bg-slate-50">
        <Row label="Head portrait" to="/personal-info">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-fuchsia-500 via-pink-500 to-orange-400 text-white text-xs font-black">
            {phoneDigits.slice(-2) || "GI"}
          </span>
        </Row>
        <Row label="Mobile number">
          <span className="text-slate-600">{phoneDigits}</span>
        </Row>
        <Row label="Name" to="/personal-info"><span className="text-slate-400">Click Settings</span></Row>
        <Row label="Wallet address" to="/wallet-address">
          <span className={user.walletAddress ? "text-slate-600 max-w-[160px] truncate" : "text-slate-400"}>
            {user.walletAddress || "Click Settings"}
          </span>
        </Row>
        <Row label="Login password" to="/personal-info"><span className="text-slate-400">Click Settings</span></Row>
        <Row label="Fund password" to="/fund-password">
          <span className={user.fundPassword ? "text-slate-600" : "text-slate-400"}>
            {user.fundPassword ? "••••••" : "Click Settings"}
          </span>
        </Row>
        <Row label={<span className="text-slate-400">Empty the cache</span>} to="/personal-info" />
      </div>

      {/* Online Service floating */}
      <Link to="/account" className="fixed bottom-24 right-4 flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400 text-white shadow-lg">
          <Headphones size={22} />
        </span>
        <span className="mt-1 text-[11px] font-bold text-slate-700 leading-tight text-center">Online<br/>Service</span>
      </Link>

      {/* Exit login */}
      <button
        onClick={() => { logout(); nav({ to: "/login" }); }}
        className="w-full bg-gradient-to-r from-sky-300 to-sky-500 py-4 text-base font-bold text-white active:scale-[0.99]"
      >
        Exit login
      </button>
    </div>
  );
}

function Row({ label, children, to }: { label: React.ReactNode; children?: React.ReactNode; to?: string }) {
  const content = (
    <div className="flex items-center justify-between bg-white px-5 py-4 border-b border-slate-100">
      <span className="text-[15px] font-bold text-slate-800">{label}</span>
      <div className="flex items-center gap-2 text-sm">
        {children}
        {to && <ChevronRight size={18} className="text-slate-400" />}
      </div>
    </div>
  );
  return to ? <Link to={to as any} className="block active:bg-slate-50">{content}</Link> : content;
}
