import { Headphones, Send, X } from "lucide-react";
import { useState } from "react";

export function ServiceMascot() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && (
        <div className="fixed bottom-44 right-4 z-30 w-64 rounded-2xl bg-card p-4 shadow-elevated border border-border">
          <div className="flex items-start justify-between mb-2">
            <p className="text-sm font-bold">Customer Support</p>
            <button onClick={() => setOpen(false)} aria-label="Close">
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Reach our team 24/7 on Telegram for fast assistance.
          </p>
          <a
            href="https://t.me/globalsuuport2"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-full bg-[#229ED9] px-4 py-2.5 text-sm font-bold text-white active:scale-95 transition-transform"
          >
            <Send size={16} /> Chat on Telegram
          </a>
          <p className="mt-2 text-center text-[11px] font-mono text-muted-foreground">
            t.me/globalsuuport2
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient shadow-elevated shadow-glow active:scale-95 transition-transform"
        aria-label="Online Service"
      >
        <Headphones className="text-white" size={26} />
        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
      </button>
    </>
  );
}
