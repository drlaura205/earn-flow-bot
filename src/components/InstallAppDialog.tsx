import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Smartphone, Apple, Download, Share, Plus } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isAndroid = /Android/i.test(ua);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="items-center text-center">
          <img src="/app-icon-192.png" alt="GIC app" width={72} height={72} className="rounded-2xl shadow-lg" />
          <DialogTitle className="mt-2">Install GIC App</DialogTitle>
          <DialogDescription>
            Add GIC to your home screen for fast, full-screen access — works like a native app.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Android */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Smartphone size={18} className="text-emerald-500" /> Android
            </div>
            {installed ? (
              <p className="mt-2 text-sm text-emerald-600">App installed ✓</p>
            ) : deferred ? (
              <button
                onClick={triggerInstall}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-sm font-bold text-white active:scale-95"
              >
                <Download size={16} /> Install App
              </button>
            ) : (
              <p className="mt-2 text-xs text-slate-600">
                Open this site in <b>Chrome</b>, tap the <b>⋮</b> menu, then choose <b>“Install app”</b> or <b>“Add to Home screen”</b>.
              </p>
            )}
          </div>

          {/* iOS */}
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Apple size={18} /> iPhone / iPad
            </div>
            <ol className="mt-2 space-y-1.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="font-bold">1.</span>
                <span>Open in <b>Safari</b>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">2.</span>
                <span>Tap the <Share size={12} className="inline" /> <b>Share</b> button.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">3.</span>
                <span>Choose <Plus size={12} className="inline" /> <b>Add to Home Screen</b>.</span>
              </li>
            </ol>
          </div>

          {!isIOS && !isAndroid && (
            <p className="text-center text-[11px] text-slate-500">
              Tip: open this page on your phone to install the app.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
