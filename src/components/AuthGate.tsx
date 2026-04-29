import { ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthed, loading } = useApp();
  const nav = useNavigate();
  useEffect(() => {
    if (!loading && !isAuthed) nav({ to: "/login" });
  }, [isAuthed, loading, nav]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAuthed) return null;
  return <>{children}</>;
}
