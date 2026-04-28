import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthed } = useApp();
  const nav = useNavigate();
  useEffect(() => {
    if (!isAuthed) nav({ to: "/login" });
  }, [isAuthed, nav]);
  if (!isAuthed) return null;
  return <>{children}</>;
}
