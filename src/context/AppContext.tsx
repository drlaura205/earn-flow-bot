import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export type Tier = "Internship" | "Silver" | "Gold" | "Platinum";

export interface TierInfo {
  name: Tier;
  price: number;
  tasksPerDay: string;
  rewardPerTask: number;
  color: string;
}

export const TIERS: TierInfo[] = [
  { name: "Internship", price: 0, tasksPerDay: "1", rewardPerTask: 3, color: "from-emerald-400 to-teal-500" },
  { name: "Silver", price: 200, tasksPerDay: "3-5", rewardPerTask: 4, color: "from-slate-300 to-slate-500" },
  { name: "Gold", price: 350, tasksPerDay: "3", rewardPerTask: 7, color: "from-amber-300 to-yellow-500" },
  { name: "Platinum", price: 500, tasksPerDay: "10+", rewardPerTask: 15, color: "from-cyan-300 to-blue-500" },
];

// UI shape kept compatible with existing pages
export interface User {
  id: string;
  phone: string;
  invitationCode: string;
  myCode: string;
  balance: number;
  tier: Tier;
  walletAddress: string;
  fundPassword: string;
  todayEarnings: number;
  totalEarnings: number;
  taskCount: number;
  taskRewards: number;
  referralRewards: number;
  tasksCompletedToday: number;
  lastTaskDate: string;
  suspended: boolean;
}

interface AppState {
  user: User | null;
  isAuthed: boolean;
  loading: boolean;
  register: (data: { phone: string; password: string; invitationCode: string }) => Promise<{ ok: boolean; msg: string }>;
  login: (phone: string, password: string) => Promise<{ ok: boolean; msg: string }>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => Promise<void>;
  upgradeTier: (tier: Tier) => Promise<{ ok: boolean; msg: string }>;
  completeTask: (reward: number) => Promise<{ ok: boolean; msg: string }>;
  withdraw: (amount: number, fundPwd: string) => Promise<{ ok: boolean; msg: string }>;
  submitDeposit: (amount: number, txid: string) => Promise<{ ok: boolean; msg: string }>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

// Phone -> synthetic email for Supabase Auth
function phoneToEmail(phone: string) {
  const clean = phone.replace(/\D/g, "");
  return `${clean}@gic.local`;
}

function rowToUser(row: any): User {
  return {
    id: row.id,
    phone: row.phone,
    invitationCode: row.invitation_code || "",
    myCode: row.my_code,
    balance: Number(row.balance),
    tier: row.tier as Tier,
    walletAddress: row.wallet_address || "",
    fundPassword: row.fund_password || "",
    todayEarnings: Number(row.today_earnings),
    totalEarnings: Number(row.total_earnings),
    taskCount: row.task_count,
    taskRewards: Number(row.task_rewards),
    referralRewards: Number(row.referral_rewards),
    tasksCompletedToday: row.tasks_completed_today,
    lastTaskDate: row.last_task_date || "",
    suspended: !!row.suspended,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    if (error) {
      console.error("load profile error", error);
      setUser(null);
      return;
    }
    setUser(data ? rowToUser(data) : null);
  }, []);

  useEffect(() => {
    // Set up listener BEFORE getSession
    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        // defer to avoid deadlock
        setTimeout(() => loadProfile(sess.user.id), 0);
      } else {
        setUser(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadProfile(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const register: AppState["register"] = async ({ phone, password, invitationCode }) => {
    const email = phoneToEmail(phone);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        data: { phone, invitation_code: invitationCode },
      },
    });
    if (error) return { ok: false, msg: error.message };
    return { ok: true, msg: "Account created!" };
  };

  const login: AppState["login"] = async (phone, password) => {
    const email = phoneToEmail(phone);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, msg: error.message };
    return { ok: true, msg: "Welcome back!" };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refresh = async () => {
    if (session?.user) await loadProfile(session.user.id);
  };

  const updateUser: AppState["updateUser"] = async (patch) => {
    if (!user) return;
    const dbPatch: any = {};
    if (patch.walletAddress !== undefined) dbPatch.wallet_address = patch.walletAddress;
    if (patch.fundPassword !== undefined) dbPatch.fund_password = patch.fundPassword;
    if (patch.tier !== undefined) dbPatch.tier = patch.tier;
    if (patch.balance !== undefined) dbPatch.balance = patch.balance;
    const { error } = await supabase.from("profiles").update(dbPatch).eq("id", user.id);
    if (error) {
      console.error("updateUser", error);
      return;
    }
    await refresh();
  };

  const upgradeTier: AppState["upgradeTier"] = async (tier) => {
    if (!user) return { ok: false, msg: "Not logged in" };
    const info = TIERS.find((t) => t.name === tier)!;
    if (user.balance < info.price) return { ok: false, msg: "Insufficient balance" };
    const { error } = await supabase
      .from("profiles")
      .update({ balance: user.balance - info.price, tier })
      .eq("id", user.id);
    if (error) return { ok: false, msg: error.message };
    await refresh();
    return { ok: true, msg: `Upgraded to ${tier}` };
  };

  const completeTask: AppState["completeTask"] = async (reward) => {
    const { error } = await supabase.rpc("complete_task", { _reward: reward });
    if (error) return { ok: false, msg: error.message };
    await refresh();
    return { ok: true, msg: `+$${reward.toFixed(2)} earned` };
  };

  const withdraw: AppState["withdraw"] = async (amount, fundPwd) => {
    const { error } = await supabase.rpc("request_withdrawal", { _amount: amount, _fund_pwd: fundPwd });
    if (error) return { ok: false, msg: error.message };
    await refresh();
    return { ok: true, msg: "Withdrawal submitted. Processing 1–48 hours." };
  };

  const submitDeposit: AppState["submitDeposit"] = async (amount, txid) => {
    if (!user) return { ok: false, msg: "Not logged in" };
    const { error } = await supabase.from("deposits").insert({
      user_id: user.id, amount, txid, network: "TRC-20",
    });
    if (error) return { ok: false, msg: error.message };
    return { ok: true, msg: "Deposit submitted for review" };
  };

  return (
    <AppContext.Provider
      value={{
        user, isAuthed: !!session, loading,
        register, login, logout, updateUser,
        upgradeTier, completeTask, withdraw, submitDeposit, refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
