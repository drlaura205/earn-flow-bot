import { ReactNode, useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ArrowDownToLine, ArrowUpFromLine, Users, Settings, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

const NAV = [
  { to: "/kasongo1/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/kasongo1/deposits", label: "Deposits", icon: ArrowDownToLine },
  { to: "/kasongo1/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { to: "/kasongo1/users", label: "Users", icon: Users },
  { to: "/kasongo1/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { logout, deposits, withdrawals } = useAdmin();
  const nav = useNavigate();
  const path = useRouterState({ select: (r) => r.location.pathname });
  const [open, setOpen] = useState(true);

  const pending = deposits.filter((d) => d.status === "Pending").length + withdrawals.filter((w) => w.status === "Pending").length;

  return (
    <div className="dark min-h-screen flex bg-slate-950 text-slate-100" style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)" }}>
      <aside className={`${open ? "w-60" : "w-16"} transition-all duration-200 border-r border-slate-800 bg-slate-900/80 backdrop-blur flex flex-col`}>
        <div className="h-16 flex items-center gap-2 px-4 border-b border-slate-800">
          <ShieldCheck className="text-cyan-400 shrink-0" size={22} />
          {open && <span className="font-bold tracking-wide">GIC Admin</span>}
          <button onClick={() => setOpen((v) => !v)} className="ml-auto p-1.5 rounded hover:bg-slate-800">
            <Menu size={16} />
          </button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => {
            const active = path === to;
            const showBadge = to === "/kasongo1/dashboard" && pending > 0;
            return (
              <Link
                key={to} to={to}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${active ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "text-slate-300 hover:bg-slate-800/70"}`}
              >
                <Icon size={18} className="shrink-0" />
                {open && <span>{label}</span>}
                {showBadge && open && (
                  <span className="ml-auto rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5">{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={async () => { await logout(); nav({ to: "/kasongo1/login" }); }}
          className="m-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-500/15 hover:text-red-300 transition"
        >
          <LogOut size={18} />
          {open && <span>Logout</span>}
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

export function AdminGate({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdmin();
  const nav = useNavigate();
  useEffect(() => {
    if (!isAdmin) nav({ to: "/kasongo1/login" });
  }, [isAdmin, nav]);
  if (!isAdmin) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Checking admin session…
      </div>
    );
  }
  return <AdminLayout>{children}</AdminLayout>;
}
