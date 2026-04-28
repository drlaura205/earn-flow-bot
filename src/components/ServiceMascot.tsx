import { Headphones } from "lucide-react";
import { toast } from "sonner";

export function ServiceMascot() {
  return (
    <button
      onClick={() => toast("Online support is currently offline. Please contact admin.")}
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient shadow-elevated shadow-glow active:scale-95 transition-transform"
      aria-label="Online Service"
    >
      <Headphones className="text-white" size={26} />
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
    </button>
  );
}
