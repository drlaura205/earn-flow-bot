import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import { toast } from "sonner";
import { Copy, ChevronLeft, Lock } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/invite")({
  component: () => (<AuthGate><Invite /></AuthGate>),
});

function Invite() {
  const { user } = useApp();
  const nav = useNavigate();
  const displayCode = user?.myCode || "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const fullLink = `${origin}/register?code=${displayCode}`;
  const shortLink = fullLink.replace(/^https?:\/\//, "");
  const isUpgraded = !!user && user.tier !== "Internship";
  const friendName = user?.phone ? user.phone.replace("+591", "").slice(-9) : "";

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-sky-200 via-teal-100 to-rose-200 px-5 pt-4 pb-10"
    >
      <button onClick={() => nav({ to: "/account" })} className="text-white/90" aria-label="Back">
        <ChevronLeft size={28} />
      </button>

      <div className="mt-32 rounded-3xl bg-slate-500/30 backdrop-blur-md p-6 shadow-xl">
        {!isUpgraded ? (
          <div className="text-center text-white py-8">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/30">
              <Lock size={26} />
            </div>
            <p className="text-base font-bold">Upgrade Required</p>
            <p className="mt-2 text-sm text-white/85">
              Referrals are available for Silver, Gold, and Platinum members.
            </p>
            <Link
              to="/robot"
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-amber-500 to-fuchsia-600 px-6 py-2.5 text-sm font-bold"
            >
              Upgrade Now
            </Link>
          </div>
        ) : (
          <>
            <p className="text-center text-xl font-bold text-yellow-300">
              Your best friend{friendName}
            </p>
            <p className="text-center text-lg text-yellow-300">
              Invite you to join the GIC
            </p>

            <div className="mt-6 flex justify-center">
              <div className="rounded-3xl bg-white p-4 shadow-lg">
                <QRCodeSVG value={fullLink} size={180} level="M" />
              </div>
            </div>

            <div className="mt-16 flex items-center justify-center gap-4">
              <p className="text-4xl font-black text-white tracking-wider">{displayCode}</p>
              <button onClick={() => copy(displayCode, "Code")} aria-label="Copy code" className="text-white active:scale-90">
                <Copy size={22} />
              </button>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              <p className="truncate text-sm text-white/95">{shortLink}</p>
              <button onClick={() => copy(fullLink, "Link")} aria-label="Copy link" className="text-white active:scale-90 flex-shrink-0">
                <Copy size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
