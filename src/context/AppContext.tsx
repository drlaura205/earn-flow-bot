import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Tier = "Internship" | "Silver" | "Gold" | "Platinum";

export interface TierInfo {
  name: Tier;
  price: number;
  tasksPerDay: string;
  rewardPerTask: number;
  color: string;
}

export const TIERS: TierInfo[] = [
  { name: "Internship", price: 0, tasksPerDay: "1-2", rewardPerTask: 0.5, color: "from-emerald-400 to-teal-500" },
  { name: "Silver", price: 200, tasksPerDay: "3-5", rewardPerTask: 4, color: "from-slate-300 to-slate-500" },
  { name: "Gold", price: 350, tasksPerDay: "5-8", rewardPerTask: 8, color: "from-amber-300 to-yellow-500" },
  { name: "Platinum", price: 500, tasksPerDay: "10+", rewardPerTask: 15, color: "from-cyan-300 to-blue-500" },
];

export interface User {
  phone: string;
  password: string;
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
}

interface AppState {
  user: User | null;
  isAuthed: boolean;
  register: (data: { phone: string; password: string; invitationCode: string }) => void;
  login: (phone: string, password: string) => boolean;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  upgradeTier: (tier: Tier) => boolean;
  completeTask: (reward: number) => void;
  withdraw: (amount: number, fundPwd: string) => { ok: boolean; msg: string };
}

const AppContext = createContext<AppState | null>(null);

const STORAGE_KEY = "gic_user_v1";

function genCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }, [user]);

  const register: AppState["register"] = ({ phone, password, invitationCode }) => {
    const newUser: User = {
      phone,
      password,
      invitationCode,
      myCode: genCode(),
      balance: 5,
      tier: "Internship",
      walletAddress: "",
      fundPassword: "",
      todayEarnings: 0,
      totalEarnings: 0,
      taskCount: 0,
      taskRewards: 0,
      referralRewards: 0,
      tasksCompletedToday: 0,
      lastTaskDate: new Date().toDateString(),
    };
    setUser(newUser);
  };

  const login: AppState["login"] = (phone, password) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const u: User = JSON.parse(raw);
      if (u.phone === phone && u.password === password) {
        setUser(u);
        return true;
      }
    } catch {}
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser: AppState["updateUser"] = (patch) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  };

  const upgradeTier: AppState["upgradeTier"] = (tier) => {
    if (!user) return false;
    const info = TIERS.find((t) => t.name === tier)!;
    if (user.balance < info.price) return false;
    setUser({ ...user, balance: user.balance - info.price, tier });
    return true;
  };

  const completeTask: AppState["completeTask"] = (reward) => {
    setUser((u) => {
      if (!u) return u;
      const today = new Date().toDateString();
      const sameDay = u.lastTaskDate === today;
      return {
        ...u,
        balance: u.balance + reward,
        todayEarnings: (sameDay ? u.todayEarnings : 0) + reward,
        totalEarnings: u.totalEarnings + reward,
        taskCount: u.taskCount + 1,
        taskRewards: u.taskRewards + reward,
        tasksCompletedToday: (sameDay ? u.tasksCompletedToday : 0) + 1,
        lastTaskDate: today,
      };
    });
  };

  const withdraw: AppState["withdraw"] = (amount, fundPwd) => {
    if (!user) return { ok: false, msg: "Not logged in" };
    if (!user.walletAddress) return { ok: false, msg: "Set USDT wallet address first" };
    if (!user.fundPassword) return { ok: false, msg: "Set fund password first" };
    if (user.fundPassword !== fundPwd) return { ok: false, msg: "Incorrect fund password" };
    if (amount < 1) return { ok: false, msg: "Minimum withdrawal is $1" };
    if (amount > user.balance) return { ok: false, msg: "Insufficient balance" };
    setUser({ ...user, balance: user.balance - amount });
    return { ok: true, msg: "Withdrawal request submitted" };
  };

  return (
    <AppContext.Provider
      value={{ user, isAuthed: !!user, register, login, logout, updateUser, upgradeTier, completeTask, withdraw }}
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
