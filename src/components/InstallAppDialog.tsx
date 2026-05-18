import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Smartphone, Apple, Download, Share, Plus, ArrowLeft } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallAppDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<null | "android" | "ios">(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!open) setPlatform(null);
  }, [open]);

  const triggerInstall = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const { outcome } = await deferred.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferred(null);
  };

  // Auto-fire Chrome's native install prompt the moment the user picks Android
  useEffect(() => {
    if (platform === "android" && deferred && !installed) {
      triggerInstall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, deferred]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl">
        <DialogHeader className="items-center text-center">
          <img src="/app-icon-192.png" alt="GIC app" width={64} height={64} className="rounded-2xl shadow-lg" />
          <DialogTitle className="mt-2">{platform ? "Install GIC App" : "Choose Platform"}</DialogTitle>
          <DialogDescription>
            {platform
              ? "Follow the steps below to add GIC to your home screen."
              : "Select your device type to start the install."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {!platform && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPlatform("android")}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-5 active:scale-95 transition hover:bg-slate-50"
              >
                <Smartphone size={32} className="text-emerald-500" />
                <span className="text-sm font-semibold text-slate-800">Android</span>
              </button>
              <button
                onClick={() => setPlatform("ios")}
                className="flex flex-col items-center gap-2 rounded-2xl border border-slate-200 p-5 active:scale-95 transition hover:bg-slate-50"
              >
                <Apple size={32} className="text-slate-800" />
                <span className="text-sm font-semibold text-slate-800">iPhone / iPad</span>
              </button>
            </div>
          )}

          {platform === "android" && (
            <div className="rounded-xl border border-slate-200 p-4">
              {installed ? (
                <p className="text-sm text-emerald-600 text-center">App installed successfully!</p>
              ) : deferred ? (
                <button
                  onClick={triggerInstall}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 py-3 text-sm font-bold text-white active:scale-95"
                >
                  <Download size={16} /> Install App
                </button>
              ) : (
                <>
                  <p className="text-sm text-slate-700 text-center font-medium">Manual Install</p>
                  <ol className="mt-2 space-y-1 text-xs text-slate-600">
                    <li>Open this site in <b>Chrome</b>.</li>
                    <li>Tap the <b>⋮</b> menu (top right).</li>
                    <li>Choose <b>“Install app”</b> or <b>“Add to Home screen”</b>.</li>
                  </ol>
                </>
              )}
              <button
                onClick={() => setPlatform(null)}
                className="mt-3 flex w-full items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          )}

          {platform === "ios" && (
            <div className="rounded-xl border border-slate-200 p-4">
              <ol className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <span>Open this page in <b>Safari</b>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <span>Tap the <Share size={14} className="inline align-text-bottom" /> <b>Share</b> button.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <span>Choose <Plus size={14} className="inline align-text-bottom" /> <b>Add to Home Screen</b>.</span>
                </li>
              </ol>
              <button
                onClick={() => setPlatform(null)}
                className="mt-4 flex w-full items-center justify-center gap-1 text-xs text-slate-500 hover:text-slate-700"
              >
                <ArrowLeft size={14} /> Back
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
