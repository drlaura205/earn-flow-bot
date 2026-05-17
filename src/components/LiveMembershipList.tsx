import { useEffect, useState } from "react";

const AVATARS = [
  "https://i.pravatar.cc/100?img=1",
  "https://i.pravatar.cc/100?img=2",
  "https://i.pravatar.cc/100?img=3",
  "https://i.pravatar.cc/100?img=5",
  "https://i.pravatar.cc/100?img=7",
  "https://i.pravatar.cc/100?img=8",
  "https://i.pravatar.cc/100?img=9",
  "https://i.pravatar.cc/100?img=10",
  "https://i.pravatar.cc/100?img=11",
  "https://i.pravatar.cc/100?img=12",
  "https://i.pravatar.cc/100?img=13",
  "https://i.pravatar.cc/100?img=14",
  "https://i.pravatar.cc/100?img=15",
  "https://i.pravatar.cc/100?img=16",
  "https://i.pravatar.cc/100?img=17",
  "https://i.pravatar.cc/100?img=20",
  "https://i.pravatar.cc/100?img=24",
  "https://i.pravatar.cc/100?img=25",
  "https://i.pravatar.cc/100?img=26",
  "https://i.pravatar.cc/100?img=30",
  "https://i.pravatar.cc/100?img=32",
  "https://i.pravatar.cc/100?img=33",
  "https://i.pravatar.cc/100?img=36",
  "https://i.pravatar.cc/100?img=45",
  "https://i.pravatar.cc/100?img=47",
  "https://i.pravatar.cc/100?img=48",
  "https://i.pravatar.cc/100?img=49",
  "https://i.pravatar.cc/100?img=51",
  "https://i.pravatar.cc/100?img=52",
  "https://i.pravatar.cc/100?img=56",
  "https://i.pravatar.cc/100?img=60",
  "https://i.pravatar.cc/100?img=65",
];

type Member = {
  key: number;
  id: string;
  avatar: string;
  tasks: number;
  usdt: number;
};

const TASK_PRESETS = [3, 5, 8, 12, 16, 20, 25, 30, 35, 50, 60, 80, 100];

function rand(seed: number): Member {
  const tasks = TASK_PRESETS[Math.floor(Math.random() * TASK_PRESETS.length)];
  const perTask = [1, 1.5, 2, 3, 4, 7, 15][Math.floor(Math.random() * 7)];
  const usdt = Math.round(tasks * perTask);
  const id = String(Math.floor(1000 + Math.random() * 8999));
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  return { key: seed, id, avatar, tasks, usdt };
}

export function LiveMembershipList() {
  const [items, setItems] = useState<Member[]>(() =>
    Array.from({ length: 6 }, (_, i) => rand(i)),
  );

  useEffect(() => {
    let k = 1000;
    const t = setInterval(() => {
      setItems((prev) => [rand(k++), ...prev].slice(0, 6));
    }, 2500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-3xl font-black text-slate-900">Membership list</h2>
      <ul className="mt-3 space-y-4">
        {items.map((m) => (
          <li
            key={m.key}
            className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500"
          >
            <img
              src={m.avatar}
              alt=""
              loading="lazy"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-white shadow"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                Congratulations ****{m.id}
              </p>
              <p className="text-xs text-sky-500">
                Complete {m.tasks} task today
              </p>
            </div>
            <span className="text-base font-black text-sky-500">
              {m.usdt}USDT
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
