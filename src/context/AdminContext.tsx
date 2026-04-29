import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ReqStatus = "Pending" | "Approved" | "Rejected" | "Paid";
export type AdminTier = "Internship" | "Silver" | "Gold" | "Platinum";

export interface DepositReq {
  id: string;
  userId: string;
  phone: string;
  amount: number;
  txid: string;
  date: string;
  status: ReqStatus;
}

export interface WithdrawReq {
  id: string;
  userId: string;
  phone: string;
  amount: number;
  fee: number;
  netAmount: number;
  address: string;
  network: string;
  date: string;
  status: ReqStatus;
}

export interface AdminUser {
  id: string;
  phone: string;
  balance: number;
  tier: AdminTier;
  upline: string;
  joined: string;
  status: "Active" | "Suspended";
  totalEarnings: number;
  taskCount: number;
}

export interface SystemSettings {
  dailyRates: { Internship: number; Silver: number; Gold: number; Platinum: number };
  walletAddress: string;
  minWithdrawal: number;
  feeRate: number;
}

interface AdminState {
  isAdmin: boolean;
  loading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => Promise<void>;
  deposits: DepositReq[];
  withdrawals: WithdrawReq[];
  users: AdminUser[];
  settings: SystemSettings;
  approveDeposit: (id: string) => Promise<void>;
  rejectDeposit: (id: string) => Promise<void>;
  payWithdrawal: (id: string) => Promise<void>;
  rejectWithdrawal: (id: string) => Promise<void>;
  adjustBalance: (userId: string, delta: number) => Promise<void>;
  setUserTier: (userId: string, tier: AdminTier) => Promise<void>;
  toggleSuspend: (userId: string) => Promise<void>;
  updateSettings: (s: Partial<SystemSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AdminState | null>(null);

// Synthetic admin email used only for the demo admin account.
const ADMIN_EMAIL = "admin@gic.local";
const ADMIN_PASSWORD = "admin123";

const fmtDate = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().slice(0, 16).replace("T", " ");
};

const defaultSettings: SystemSettings = {
  dailyRates: { Internship: 3, Silver: 4, Gold: 8, Platinum: 15 },
  walletAddress: "",
  minWithdrawal: 2,
  feeRate: 0.08,
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositReq[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawReq[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);

  const checkAdminRole = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    return !!data;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesR, depositsR, withdrawalsR, settingsR] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("deposits").select("*").order("created_at", { ascending: false }),
        supabase.from("withdrawals").select("*").order("created_at", { ascending: false }),
        supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
      ]);

      const profileMap = new Map<string, any>();
      (profilesR.data || []).forEach((p: any) => profileMap.set(p.id, p));

      setUsers(
        (profilesR.data || []).map((p: any) => ({
          id: p.id,
          phone: p.phone,
          balance: Number(p.balance) || 0,
          tier: (p.tier || "Internship") as AdminTier,
          upline: p.invitation_code || "—",
          joined: (p.created_at || "").slice(0, 10),
          status: p.suspended ? "Suspended" : "Active",
          totalEarnings: Number(p.total_earnings) || 0,
          taskCount: Number(p.task_count) || 0,
        })),
      );

      setDeposits(
        (depositsR.data || []).map((d: any) => ({
          id: d.id,
          userId: d.user_id,
          phone: profileMap.get(d.user_id)?.phone || "—",
          amount: Number(d.amount),
          txid: d.txid || "",
          date: fmtDate(d.created_at),
          status: d.status as ReqStatus,
        })),
      );

      setWithdrawals(
        (withdrawalsR.data || []).map((w: any) => ({
          id: w.id,
          userId: w.user_id,
          phone: profileMap.get(w.user_id)?.phone || "—",
          amount: Number(w.amount),
          fee: Number(w.fee),
          netAmount: Number(w.net_amount),
          address: w.address,
          network: w.network,
          date: fmtDate(w.created_at),
          status: w.status as ReqStatus,
        })),
      );

      if (settingsR.data) {
        const s: any = settingsR.data;
        const rates = s.tier_rates || {};
        setSettings({
          dailyRates: {
            Internship: Number(rates.Internship ?? 3),
            Silver: Number(rates.Silver ?? 4),
            Gold: Number(rates.Gold ?? 8),
            Platinum: Number(rates.Platinum ?? 15),
          },
          walletAddress: s.deposit_address || "",
          minWithdrawal: Number(s.min_withdrawal ?? 2),
          feeRate: Number(s.withdrawal_fee_rate ?? 0.08),
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Bootstrap from existing session
  useEffect(() => {
    let mounted = true;
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      const uid = session?.user?.id;
      if (!uid) {
        setIsAdmin(false);
        return;
      }
      // defer role check
      setTimeout(async () => {
        const ok = await checkAdminRole(uid);
        if (!mounted) return;
        setIsAdmin(ok);
        if (ok) refresh();
      }, 0);
    });

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const ok = await checkAdminRole(session.user.id);
        if (!mounted) return;
        setIsAdmin(ok);
        if (ok) refresh();
      }
    })();

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [checkAdminRole, refresh]);

  // Realtime subscriptions while admin
  useEffect(() => {
    if (!isAdmin) return;
    const ch = supabase
      .channel("admin-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "deposits" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "withdrawals" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [isAdmin, refresh]);

  const login = async (u: string, p: string) => {
    // Accept either "admin" or full email; password must match.
    const email = u === "admin" ? ADMIN_EMAIL : u;
    const password = p;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return false;
    const ok = await checkAdminRole(data.user.id);
    setIsAdmin(ok);
    if (ok) await refresh();
    else await supabase.auth.signOut();
    return ok;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  const approveDeposit = async (id: string) => {
    await supabase.rpc("admin_approve_deposit", { _deposit_id: id });
    await refresh();
  };
  const rejectDeposit = async (id: string) => {
    await supabase.rpc("admin_reject_deposit", { _deposit_id: id });
    await refresh();
  };
  const payWithdrawal = async (id: string) => {
    await supabase.rpc("admin_pay_withdrawal", { _id: id });
    await refresh();
  };
  const rejectWithdrawal = async (id: string) => {
    await supabase.rpc("admin_reject_withdrawal", { _id: id });
    await refresh();
  };
  const adjustBalance = async (userId: string, delta: number) => {
    await supabase.rpc("admin_adjust_balance", { _user_id: userId, _delta: delta });
    await refresh();
  };
  const setUserTier = async (userId: string, tier: AdminTier) => {
    await supabase.rpc("admin_set_tier", { _user_id: userId, _tier: tier });
    await refresh();
  };
  const toggleSuspend = async (userId: string) => {
    await supabase.rpc("admin_toggle_suspend", { _user_id: userId });
    await refresh();
  };
  const updateSettings = async (s: Partial<SystemSettings>) => {
    const merged = { ...settings, ...s };
    await supabase
      .from("app_settings")
      .update({
        tier_rates: merged.dailyRates,
        deposit_address: merged.walletAddress,
        min_withdrawal: merged.minWithdrawal,
        withdrawal_fee_rate: merged.feeRate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    await refresh();
  };

  return (
    <Ctx.Provider
      value={{
        isAdmin, loading, login, logout,
        deposits, withdrawals, users, settings,
        approveDeposit, rejectDeposit, payWithdrawal, rejectWithdrawal,
        adjustBalance, setUserTier, toggleSuspend, updateSettings, refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAdmin must be inside AdminProvider");
  return c;
}
