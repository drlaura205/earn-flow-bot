import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine } from "lucide-react";

type Activity = {
  id: number;
  type: "deposit" | "withdraw";
  user: string;
  amount: number;
  time: string;
};

const NAMES = [
  "Ahmed", "Sarah", "Mohammed", "Fatima", "Liam", "Aisha", "Daniel", "Priya",
  "Lucas", "Zara", "Noah", "Mia", "Omar", "Sofia", "Kenji", "Layla",
  "Rahul", "Emma", "Ali", "Chloe", "Yusuf", "Hana", "Carlos", "Anya",
];

function maskName(n: string) {
  if (n.length <= 2) return n[0] + "*";
  return n[0] + "*".repeat(Math.max(2, n.length - 2)) + n[n.length - 1];
}

function randomActivity(id: number): Activity {
  const isDep = Math.random() > 0.45;
  const presets = isDep ? [50, 100, 200, 350, 500, 750, 1000] : [10, 25, 50, 100, 200, 350, 500];
  const amount = presets[Math.floor(Math.random() * presets.length)] + Math.floor(Math.random() * 40);
  const name = NAMES[Math.floor(Math.random() * NAMES.length)];
  const mins = Math.floor(Math.random() * 5) + 1;
  return {
    id,
    type: isDep ? "deposit" : "withdraw",
    user: maskName(name),
    amount,
    time: `${mins}m ago`,
  };
}

export function LiveActivityFeed() {
  const [items, setItems] = useState<Activity[]>(() =>
    Array.from({ length: 6 }, (_, i) => randomActivity(i)),
  );

  useEffect(() => {
    let id = 1000;
    const t = setInterval(() => {
      setItems((prev) => [randomActivity(id++), ...prev].slice(0, 6));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-2xl bg-card p-4 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold">Live Activity</h2>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          LIVE
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it) => {
          const isDep = it.type === "deposit";
          const Icon = isDep ? ArrowDownToLine : ArrowUpFromLine;
          return (
            <li
              key={it.id}
              className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2 animate-in fade-in slide-in-from-top-1 duration-300"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-white ${
                  isDep ? "bg-emerald-500" : "bg-cyan-500"
                }`}
              >
                <Icon size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">
                  {it.user} {isDep ? "deposited" : "withdrew"}
                </p>
                <p className="text-[10px] text-muted-foreground">{it.time} • TRC-20</p>
              </div>
              <p className={`text-sm font-bold ${isDep ? "text-emerald-600" : "text-cyan-600"}`}>
                {isDep ? "+" : "-"}${it.amount}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
