import { Headphones } from "lucide-react";

export function ServiceMascot() {
  return (
    <a
      href="https://t.me/gicsupp"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary-gradient shadow-elevated shadow-glow active:scale-95 transition-transform"
      aria-label="Online Service"
    >
      <Headphones className="text-white" size={26} />
      <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
    </a>
  );
}
