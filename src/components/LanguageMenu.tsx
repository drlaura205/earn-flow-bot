import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { LANGS, useLang } from "@/context/LanguageContext";

interface Props {
  variant?: "text" | "icon";
  className?: string;
}

export function LanguageMenu({ variant = "text", className = "" }: Props) {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const current = LANGS.find((l) => l.code === lang)!;

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={
          variant === "icon"
            ? "flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow"
            : "flex items-center gap-1.5 text-base text-slate-800/80"
        }
        aria-label={t("language")}
      >
        {variant === "icon" ? (
          <Globe size={20} />
        ) : (
          <>
            <span>{current.flag}</span>
            <span>{t("language")}</span>
          </>
        )}
      </button>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-44 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-black/5 ${
            variant === "icon" ? "left-0" : "right-0"
          }`}
        >
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                onClick={() => { setLang(l.code); setOpen(false); }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm text-slate-800 hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{l.flag}</span>
                  <span>{l.label}</span>
                </span>
                {active && <Check size={16} className="text-emerald-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
