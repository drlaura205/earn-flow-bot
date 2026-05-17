import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, Headphones } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";

export const Route = createFileRoute("/wallet-address")({
  component: () => (<AuthGate><WalletAddress /></AuthGate>),
});

function WalletAddress() {
  const { user, updateUser } = useApp();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [addr, setAddr] = useState(user?.walletAddress || "");

  if (!user) return null;

  const save = async () => {
    if (!name.trim()) return toast.error("Please enter account holder name");
    if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(addr)) {
      return toast.error("Invalid TRC-20 address. Must start with T and be 34 chars.");
    }
    await updateUser({ walletAddress: addr });
    toast.success("Wallet address saved");
    nav({ to: "/personal-info" });
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="relative bg-white px-4 pt-12 pb-4 border-b border-slate-100">
        <button onClick={() => nav({ to: "/personal-info" })} className="absolute left-3 top-12 flex h-9 w-9 items-center justify-center">
          <ChevronLeft size={24} className="text-slate-500" />
        </button>
        <h1 className="text-center text-lg font-bold text-slate-800">Wallet Address</h1>
      </div>

      <div className="bg-white">
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-[15px] font-bold text-slate-800 leading-tight">Account<br/>Holder Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.toUpperCase())}
            placeholder="Enter name"
            className="flex-1 ml-4 text-right bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-[15px] font-bold text-slate-800">Wallet</span>
          <span className="text-sm text-slate-700">TRC-USDT</span>
        </div>

        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-[15px] font-bold text-slate-800 leading-tight">Wallet<br/>Nmuber</span>
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value.trim())}
            placeholder="Please enter Wallet address"
            className="flex-1 ml-4 text-right bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-mono"
          />
        </div>
      </div>

      <div className="px-6 pt-6">
        <p className="text-center text-sm text-slate-500 leading-relaxed">
          Please make sure that the bound U address is exactly the same as your account address, otherwise the withdrawal will not be successful.
        </p>

        <button
          onClick={save}
          className="mt-8 w-full rounded-full bg-sky-400 py-4 text-base font-bold text-white shadow active:scale-[0.98]"
        >
          Please add your TRC-20 wallet address
        </button>
      </div>

      <Headphones className="hidden" />
      <div className="fixed bottom-6 right-4 flex flex-col items-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-400 text-white shadow-lg">
          <Headphones size={22} />
        </span>
        <span className="mt-1 text-[11px] font-bold text-slate-700 leading-tight text-center">Online<br/>Service</span>
      </div>
    </div>
  );
}
