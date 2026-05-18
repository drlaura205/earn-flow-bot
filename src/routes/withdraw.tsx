import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Headphones } from "lucide-react";
import { AuthGate } from "@/components/AuthGate";
import { BottomNav } from "@/components/BottomNav";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { MIN_WITHDRAWAL, isWithdrawWindowOpen } from "@/lib/withdrawWindow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/withdraw")({
  component: () => (<AuthGate><Withdraw /></AuthGate>),
});

const PRESETS = [2, 15, 50, 100, 300, 500, 1000, 3000, 5000, 10000, 30000, 50000];

function Withdraw() {
  const { user, withdraw } = useApp();
  const nav = useNavigate();
  const [amount, setAmount] = useState<number | null>(null);
  const [pwd, setPwd] = useState("");
  const [contactOpen, setContactOpen] = useState(false);

  if (!user) return null;

  const wallet = user.walletAddress || "";
  const walletDisplay = wallet
    ? wallet.match(/.{1,18}/g)?.slice(0, 3).join("\n") || wallet
    : "Not set";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user.withdrawEnabled) {
      setContactOpen(true);
      return;
    }
    if (!user.fundPassword) {
      toast.error("Please set a 6-digit fund password first");
      nav({ to: "/fund-password" });
      return;
    }
    if (!isWithdrawWindowOpen()) {
      return toast.error("Withdrawals are open Monday–Friday, 09:00–20:00 UK time.");
    }
    const n = amount || 0;
    if (n < MIN_WITHDRAWAL) return toast.error(`Minimum withdrawal is $${MIN_WITHDRAWAL}`);
    if (pwd.length !== 6) return toast.error("Fund password must be 6 digits");
    const r = await withdraw(n, pwd);
    if (r.ok) { toast.success(r.msg); nav({ to: "/account" }); }
    else toast.error(r.msg);
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-[#f3f4f6] pb-24">
      {/* Header */}
      <div className="bg-white px-4 pt-3 pb-4 flex items-center justify-between">
        <button onClick={() => nav({ to: "/account" })} className="p-1">
          <ChevronLeft className="text-gray-500" size={26} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">Withdrawal</h1>
        <Link to="/history" className="text-sm text-gray-600">Withdrawal record</Link>
      </div>

      <div className="p-3 space-y-3">

        {/* Balances */}
        <div className="bg-white rounded-xl px-5 py-4">
          <div className="py-3 border-b border-gray-100 text-base text-gray-800">
            Main Wallet: {user.balance.toFixed(4)}
          </div>
          <div className="py-3 text-base text-gray-800">
            Commission Wallet: {Number(user.referralRewards || 0).toFixed(4)}
          </div>
        </div>

        {/* Wallet Type + Method */}
        <div className="bg-white rounded-xl px-5 py-2">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <span className="text-gray-800">Wallet Type</span>
            <div className="flex items-center gap-1 text-gray-500">
              <span>Main Wallet</span>
              <ChevronRight size={18} />
            </div>
          </div>
          <div className="flex items-start justify-between py-4 gap-3">
            <span className="text-gray-800 pt-1">Withdrawal method</span>
            <div className="flex items-start gap-1 flex-1 justify-end">
              <div className="text-right text-gray-700 leading-6">
                <div>TRC-USDT</div>
                {wallet ? (
                  <pre className="font-sans text-sm whitespace-pre-wrap break-all text-right">{walletDisplay}</pre>
                ) : (
                  <Link to="/wallet-address" className="text-sky-500 text-sm">Set wallet</Link>
                )}
              </div>
              <ChevronRight size={18} className="text-gray-400 mt-1" />
            </div>
          </div>
        </div>

        {/* Amount grid */}
        <div className="bg-white rounded-xl px-5 pt-5 pb-5">
          <p className="text-slate-500 mb-4">Withdrawal amount</p>
          <div className="grid grid-cols-4 gap-3">
            {PRESETS.map((p) => {
              const active = amount === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-lg border py-3 text-base font-bold transition ${
                    active
                      ? "border-sky-400 bg-sky-50 text-sky-600"
                      : "border-gray-200 bg-white text-gray-800"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fund password */}
        <form onSubmit={submit} className="space-y-3">
          <div className="bg-white rounded-xl px-5 py-5 flex items-start justify-between gap-4">
            <span className="text-gray-800 whitespace-nowrap">Fund<br/>password</span>
            <input
              type="password" inputMode="numeric" maxLength={6}
              value={pwd} onChange={(e) => setPwd(e.target.value.replace(/\D/g, ""))}
              placeholder="Please input fund password"
              className="flex-1 text-right outline-none text-gray-700 placeholder:text-gray-500 bg-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-sky-400 hover:bg-sky-500 py-3.5 text-base font-medium text-white transition"
          >
            Submit
          </button>

          <p className="text-center text-[11px] text-gray-400">
            Minimum withdrawal ${MIN_WITHDRAWAL} · TRC-20 network only
          </p>
        </form>
      </div>

      {/* Online Service bubble */}
      <div className="fixed bottom-24 right-3 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-sky-400 flex items-center justify-center shadow-lg">
          <Headphones className="text-white" size={22} />
        </div>
        <span className="text-[11px] font-bold text-gray-700 mt-0.5 leading-tight text-center">Online<br/>Service</span>
      </div>

      <BottomNav />

      <Dialog open={contactOpen} onOpenChange={setContactOpen}>
        <DialogContent className="max-w-xs rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">Please contact the hiring manager</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setContactOpen(false)}
              className="w-full rounded-md bg-sky-400 hover:bg-sky-500 py-2.5 text-sm font-semibold text-white"
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
