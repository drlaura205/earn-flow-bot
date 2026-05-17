import { Link, useLocation } from "@tanstack/react-router";
import { Home, LayoutGrid, Crown, TrendingUp, User } from "lucide-react";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/job", label: "Task Area", icon: LayoutGrid },
  { to: "/job", label: "Join", icon: Crown },
  { to: "/team", label: "Profit", icon: TrendingUp },
  { to: "/account", label: "My", icon: User },
] as const;

export function BottomNav() {
  const loc = useLocation();
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-md -translate-x-1/2 border-t border-border bg-card/95 backdrop-blur-md shadow-card">
      <ul className="grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = loc.pathname === to;
          return (
            <li key={to}>
              <Link
                to={to}
                className="flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors"
              >
                <Icon
                  size={22}
                  className={active ? "text-teal-500" : "text-muted-foreground"}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={`text-[11px] font-medium ${
                    active ? "text-teal-500" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
