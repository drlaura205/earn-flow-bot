import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { ServiceMascot } from "./ServiceMascot";

export function MobileShell({ children, hideNav }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="mx-auto min-h-screen w-full max-w-md bg-app-gradient pb-24">
      {children}
      {!hideNav && <ServiceMascot />}
      {!hideNav && <BottomNav />}
    </div>
  );
}
