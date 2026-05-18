import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/integrations/supabase/client";
import { Users } from "lucide-react";

export const Route = createFileRoute("/team")({
  component: () => (
    <AuthGate>
      <MobileShell><Team /></MobileShell>
    </AuthGate>
  ),
});

type Member = {
  user_id: string;
  phone: string;
  tier: string;
  level: "A" | "B" | "C";
  joined_at: string;
};

function maskPhone(p: string) {
  if (!p) return "";
  const clean = p.replace(/\D/g, "");
  if (clean.length < 4) return "***";
  return clean.slice(0, 3) + "****" + clean.slice(-3);
}

function Team() {
  const { user } = useApp();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"A" | "B" | "C">("A");

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_my_downline");
      if (!error && data) setMembers(data as Member[]);
      setLoading(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const g: Record<"A" | "B" | "C", Member[]> = { A: [], B: [], C: [] };
    members.forEach((m) => g[m.level].push(m));
    return g;
  }, [members]);

  if (!user) return null;

  const levels = [
    { key: "A" as const, name: "Level A", commission: "5%" },
    { key: "B" as const, name: "Level B", commission: "3%" },
    { key: "C" as const, name: "Level C", commission: "1%" },
  ];

  return (
    <div>
      <div className="bg-hero-gradient px-5 pt-12 pb-10 text-white rounded-b-[2rem]">
        <h1 className="text-2xl font-black">My Team</h1>
        <p className="text-sm text-white/80">Build your downline, earn lifetime commissions</p>

        <div className="mt-5 rounded-2xl bg-white/15 p-5 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <Users size={22} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Team Size</p>
              <p className="text-3xl font-black">{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-5">
        <h2 className="mb-3 text-base font-bold">Level Breakdown</h2>
        <div className="grid grid-cols-3 gap-2">
          {levels.map((l) => (
            <button
              key={l.key}
              onClick={() => setTab(l.key)}
              className={`rounded-xl p-3 text-left shadow-card transition ${
                tab === l.key ? "bg-primary-gradient text-white" : "bg-card"
              }`}
            >
              <p className="text-[11px] opacity-80">{l.name}</p>
              <p className="text-2xl font-black">{grouped[l.key].length}</p>
              <p className="text-[10px] opacity-75">Comm {l.commission}</p>
            </button>
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-base font-bold">
          {levels.find((l) => l.key === tab)?.name} Members
        </h2>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : grouped[tab].length === 0 ? (
          <div className="rounded-xl bg-card p-6 text-center shadow-card">
            <p className="text-sm text-muted-foreground">No {tab}-level members yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Share your invite code to grow your team.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {grouped[tab].map((m) => (
              <div
                key={m.user_id}
                className="flex items-center justify-between rounded-xl bg-card p-3 shadow-card"
              >
                <div>
                  <p className="text-sm font-bold">{maskPhone(m.phone)}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Joined {new Date(m.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-primary-gradient px-3 py-1 text-xs font-bold text-white">
                  {m.tier}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-xl bg-card p-4 shadow-card text-center">
          <p className="text-xs text-muted-foreground">Total Referral Rewards</p>
          <p className="mt-1 text-2xl font-black">${user.referralRewards.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
