import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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
}

export interface SystemSettings {
  dailyRates: { Silver: number; Gold: number; Platinum: number };
  walletAddress: string;
  minWithdrawal: number;
}

interface AdminState {
  isAdmin: boolean;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  deposits: DepositReq[];
  withdrawals: WithdrawReq[];
  users: AdminUser[];
  settings: SystemSettings;
  approveDeposit: (id: string) => void;
  rejectDeposit: (id: string) => void;
  payWithdrawal: (id: string) => void;
  rejectWithdrawal: (id: string) => void;
  adjustBalance: (userId: string, delta: number) => void;
  setUserTier: (userId: string, tier: AdminTier) => void;
  toggleSuspend: (userId: string) => void;
  updateSettings: (s: Partial<SystemSettings>) => void;
}

const Ctx = createContext<AdminState | null>(null);
const SESSION_KEY = "gic_admin_session_v1";
const SESSION_MS = 30 * 60 * 1000; // 30 min

const seedDeposits: DepositReq[] = [
  { id: "D-1042", userId: "U-3301", phone: "+1 555 0190", amount: 200, txid: "0xabc...d4f1", date: "2026-04-27 14:22", status: "Pending" },
  { id: "D-1041", userId: "U-3287", phone: "+44 7700 900812", amount: 500, txid: "0x91e...a02c", date: "2026-04-27 11:08", status: "Pending" },
  { id: "D-1040", userId: "U-3210", phone: "+91 98220 12345", amount: 350, txid: "0x77f...3b9d", date: "2026-04-26 22:51", status: "Approved" },
  { id: "D-1039", userId: "U-3155", phone: "+62 812 3456 7890", amount: 200, txid: "0x12a...ee08", date: "2026-04-26 18:30", status: "Approved" },
  { id: "D-1038", userId: "U-3099", phone: "+1 555 0142", amount: 500, txid: "0x55b...771f", date: "2026-04-26 09:14", status: "Rejected" },
];

const seedWithdrawals: WithdrawReq[] = [
  { id: "W-2210", userId: "U-3287", phone: "+44 7700 900812", amount: 45.5, address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", network: "BEP-20", date: "2026-04-27 13:00", status: "Pending" },
  { id: "W-2209", userId: "U-3210", phone: "+91 98220 12345", amount: 120, address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72", network: "BEP-20", date: "2026-04-27 10:45", status: "Pending" },
  { id: "W-2208", userId: "U-3155", phone: "+62 812 3456 7890", amount: 25, address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", network: "BEP-20", date: "2026-04-26 19:20", status: "Paid" },
  { id: "W-2207", userId: "U-3099", phone: "+1 555 0142", amount: 80, address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", network: "BEP-20", date: "2026-04-25 16:11", status: "Paid" },
];

const seedUsers: AdminUser[] = [
  { id: "U-3301", phone: "+1 555 0190", balance: 12.5, tier: "Internship", upline: "U-3210", joined: "2026-04-27", status: "Active" },
  { id: "U-3287", phone: "+44 7700 900812", balance: 540.25, tier: "Platinum", upline: "U-3099", joined: "2026-04-20", status: "Active" },
  { id: "U-3210", phone: "+91 98220 12345", balance: 318.7, tier: "Gold", upline: "U-3099", joined: "2026-04-15", status: "Active" },
  { id: "U-3155", phone: "+62 812 3456 7890", balance: 178, tier: "Silver", upline: "U-3099", joined: "2026-04-10", status: "Active" },
  { id: "U-3099", phone: "+1 555 0142", balance: 1240.9, tier: "Platinum", upline: "—", joined: "2026-03-28", status: "Active" },
  { id: "U-3050", phone: "+33 6 12 34 56 78", balance: 0, tier: "Internship", upline: "U-3287", joined: "2026-03-22", status: "Suspended" },
];

const seedSettings: SystemSettings = {
  dailyRates: { Silver: 4, Gold: 12, Platinum: 25 },
  walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  minWithdrawal: 1,
};

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [deposits, setDeposits] = useState(seedDeposits);
  const [withdrawals, setWithdrawals] = useState(seedWithdrawals);
  const [users, setUsers] = useState(seedUsers);
  const [settings, setSettings] = useState(seedSettings);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const { exp } = JSON.parse(raw);
        if (Date.now() < exp) setIsAdmin(true);
        else sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setInterval(() => {
      try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return setIsAdmin(false);
        const { exp } = JSON.parse(raw);
        if (Date.now() >= exp) {
          sessionStorage.removeItem(SESSION_KEY);
          setIsAdmin(false);
        }
      } catch {}
    }, 30000);
    return () => clearInterval(t);
  }, [isAdmin]);

  const login = (u: string, p: string) => {
    if (u === "admin" && p === "admin123") {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ exp: Date.now() + SESSION_MS }));
      setIsAdmin(true);
      return true;
    }
    return false;
  };
  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAdmin(false);
  };

  const approveDeposit = (id: string) => {
    setDeposits((d) => d.map((x) => (x.id === id ? { ...x, status: "Approved" } : x)));
    const dep = deposits.find((x) => x.id === id);
    if (dep) setUsers((us) => us.map((u) => (u.id === dep.userId ? { ...u, balance: u.balance + dep.amount } : u)));
  };
  const rejectDeposit = (id: string) =>
    setDeposits((d) => d.map((x) => (x.id === id ? { ...x, status: "Rejected" } : x)));
  const payWithdrawal = (id: string) =>
    setWithdrawals((w) => w.map((x) => (x.id === id ? { ...x, status: "Paid" } : x)));
  const rejectWithdrawal = (id: string) => {
    const wr = withdrawals.find((x) => x.id === id);
    if (wr && wr.status === "Pending") {
      setUsers((us) => us.map((u) => (u.id === wr.userId ? { ...u, balance: u.balance + wr.amount } : u)));
    }
    setWithdrawals((w) => w.map((x) => (x.id === id ? { ...x, status: "Rejected" } : x)));
  };
  const adjustBalance = (userId: string, delta: number) =>
    setUsers((us) => us.map((u) => (u.id === userId ? { ...u, balance: Math.max(0, u.balance + delta) } : u)));
  const setUserTier = (userId: string, tier: AdminTier) =>
    setUsers((us) => us.map((u) => (u.id === userId ? { ...u, tier } : u)));
  const toggleSuspend = (userId: string) =>
    setUsers((us) =>
      us.map((u) => (u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" : "Active" } : u)),
    );
  const updateSettings = (s: Partial<SystemSettings>) => setSettings((cur) => ({ ...cur, ...s }));

  return (
    <Ctx.Provider
      value={{
        isAdmin, login, logout,
        deposits, withdrawals, users, settings,
        approveDeposit, rejectDeposit, payWithdrawal, rejectWithdrawal,
        adjustBalance, setUserTier, toggleSuspend, updateSettings,
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
