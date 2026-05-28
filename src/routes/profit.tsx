import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { AuthGate } from "@/components/AuthGate";
import { TIERS } from "@/context/AppContext";

export const Route = createFileRoute("/profit")({
  component: () => (
    <AuthGate>
      <MobileShell><Profit /></MobileShell>
    </AuthGate>
  ),
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-center text-lg font-extrabold text-white drop-shadow mb-3 mt-6">
      {children}
    </h2>
  );
}

function TierBadge({ name }: { name: string }) {
  return (
    <div className="mt-4 mb-1">
      <p className="text-sm font-bold text-slate-900">{name}</p>
      <div className="mt-1 h-1.5 w-32 rounded-sm bg-gradient-to-r from-sky-500 via-sky-300 to-transparent" />
    </div>
  );
}

function Profit() {
  const rows = TIERS.map((t) => {
    const tasks = parseInt(t.tasksPerDay, 10);
    const monthly = t.dailyIncome * 30;
    const annual = t.dailyIncome * 365;
    return {
      name: t.name,
      deposit: t.price,
      tasks,
      perTask: t.rewardPerTask,
      daily: t.dailyIncome,
      monthly,
      annual,
      duration: t.durationDays,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 via-sky-300 to-sky-100 pb-8">
      {/* Hero */}
      <div className="px-4 pt-6 pb-4 text-center">
        <h1 className="text-5xl font-black tracking-wider bg-gradient-to-b from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent drop-shadow">
          GIC
        </h1>
        <p className="mt-2 text-sm font-semibold text-white/90">
          Work Level and Income (in USDT)
        </p>
      </div>

      {/* Income Table */}
      <div className="mx-3 overflow-hidden rounded-xl bg-white/90 shadow-lg ring-1 ring-white/60">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-slate-800">
            <thead className="bg-cyan-100/80 text-slate-900">
              <tr>
                <th className="px-2 py-2 text-left">Level</th>
                <th className="px-1 py-2">Deposit</th>
                <th className="px-1 py-2">Daily<br/>Tasks</th>
                <th className="px-1 py-2">Per Task</th>
                <th className="px-1 py-2">Daily<br/>Income</th>
                <th className="px-1 py-2">Monthly</th>
                <th className="px-1 py-2">Annual</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-slate-200 text-center">
                  <td className="px-2 py-2 text-left font-bold">{r.name}</td>
                  <td className="px-1 py-2">{r.deposit}</td>
                  <td className="px-1 py-2">{r.tasks}</td>
                  <td className="px-1 py-2">{r.perTask.toFixed(2)}</td>
                  <td className="px-1 py-2 font-semibold">{r.daily.toFixed(2)}</td>
                  <td className="px-1 py-2">
                    {r.name === "Intern" ? "—" : r.monthly.toFixed(0)}
                  </td>
                  <td className="px-1 py-2">
                    {r.name === "Intern" ? "—" : r.annual.toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tier Explanations */}
      <div className="mx-3 mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.name}>
            <TierBadge name={r.name} />
            <div className="rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-3 text-[12px] leading-relaxed text-white/95 shadow-md">
              {r.name === "Intern" ? (
                <>
                  Interns do not require a work deposit. The internship lasts {r.duration} days.
                  Each day, they can complete {r.tasks} tasks, earning {r.perTask.toFixed(2)} USDT per task.
                  In total, they can earn {(r.daily * r.duration).toFixed(2)} USDT.
                </>
              ) : (
                <>
                  The {r.name} work deposit is {r.deposit.toFixed(2)} USDT. You can complete{" "}
                  {r.tasks} tasks per day, each task is {r.perTask.toFixed(2)} USDT, the daily
                  income is {r.daily.toFixed(2)} USDT, the monthly income is {r.monthly.toFixed(2)} USDT,
                  the annual income is {r.annual.toFixed(2)} USDT, and the effective working period
                  is one year.
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invitation Rewards */}
      <SectionTitle>Introduction to Invitation Rewards</SectionTitle>
      <div className="mx-3 overflow-hidden rounded-xl bg-white/90 shadow-lg ring-1 ring-white/60">
        <table className="w-full text-[11px] text-slate-800">
          <thead className="bg-cyan-100/80 text-slate-900">
            <tr>
              <th className="px-2 py-2 text-left">Level</th>
              <th className="px-1 py-2">Commission<br/>(A-B-C)</th>
              <th className="px-1 py-2">Level A<br/>(USDT)</th>
              <th className="px-1 py-2">Level B<br/>(USDT)</th>
              <th className="px-1 py-2">Level C<br/>(USDT)</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.name !== "Intern").map((r) => (
              <tr key={r.name} className="border-t border-slate-200 text-center">
                <td className="px-2 py-2 text-left font-bold">{r.name}</td>
                <td className="px-1 py-2">5%—3%—1%</td>
                <td className="px-1 py-2">{(r.deposit * 0.05).toFixed(2)}</td>
                <td className="px-1 py-2">{(r.deposit * 0.03).toFixed(2)}</td>
                <td className="px-1 py-2">{(r.deposit * 0.01).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pyramid */}
      <div className="mx-3 mt-5 flex flex-col items-center">
        <p className="text-xs font-bold text-slate-800">Me</p>
        <div className="mt-1 h-0 w-0 border-l-[60px] border-r-[60px] border-b-[50px] border-l-transparent border-r-transparent border-b-yellow-400 flex items-end justify-center" />
        <div className="-mt-1 text-center text-[11px] font-bold text-slate-900">
          5% Subordinate A
        </div>
        <div className="mt-1 h-0 w-0 border-l-[90px] border-r-[90px] border-b-[55px] border-l-transparent border-r-transparent border-b-lime-500" />
        <div className="-mt-1 text-center text-[11px] font-bold text-slate-900">
          3% Subordinate B
        </div>
        <div className="mt-1 h-0 w-0 border-l-[120px] border-r-[120px] border-b-[60px] border-l-transparent border-r-transparent border-b-sky-500" />
        <div className="-mt-1 text-center text-[11px] font-bold text-slate-900">
          1% Subordinate C
        </div>
      </div>

      <div className="mx-3 mt-4 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-3 text-[12px] leading-relaxed text-white/95 shadow-md">
        <p className="text-lime-300">
          Your subordinates are called your A-level. Your subordinates' subordinates are called
          your B-level, and your B-level's subordinates are called your C-level.
        </p>
        <p className="mt-2">
          For example, if you are a C1 and your A-level invitee becomes C1, you earn (40 × 5%) = 2 USDT.
          If your A-level invites their own subordinate to become C1, you earn (40 × 3%) = 1.20 USDT
          (their invitee becomes your B-level). If your B-level then invites a C1, you earn
          (40 × 1%) = 0.40 USDT (their invitee becomes your C-level).
        </p>
      </div>

      {/* Task Management Bonus */}
      <SectionTitle>Task Management Bonus</SectionTitle>
      <div className="mx-3 overflow-hidden rounded-xl bg-white/90 shadow-lg ring-1 ring-white/60">
        <table className="w-full text-[12px] text-slate-800">
          <thead className="bg-cyan-100/80 text-slate-900">
            <tr>
              <th className="px-3 py-2 text-left">Recommended Level</th>
              <th className="px-3 py-2 text-right">Bonus %</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2">Level A Subordinate</td>
              <td className="px-3 py-2 text-right font-bold">5%</td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2">Level B Subordinate</td>
              <td className="px-3 py-2 text-right font-bold">3%</td>
            </tr>
            <tr className="border-t border-slate-200">
              <td className="px-3 py-2">Level C Subordinate</td>
              <td className="px-3 py-2 text-right font-bold">1%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mx-3 mt-3 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-3 text-[12px] leading-relaxed text-white/95 shadow-md space-y-2">
        <p>
          When you guide your subordinates to become regular employees, you earn an additional
          management bonus when they complete their daily tasks.
        </p>
        <ul className="space-y-1">
          <li>Daily task management fee for A-level subordinates is 5%.</li>
          <li>Daily task management fee for B-level subordinates is 3%.</li>
          <li>Daily task management fee for C-level subordinates is 1%.</li>
        </ul>
        <div>
          <p className="text-cyan-300 font-bold">Calculation example:</p>
          <p>
            If you have 30 A-level, 200 B-level, and 800 C-level members, each earning 10 USDT/day:
          </p>
          <p className="text-lime-300">Level A: 10 × 30 × 5% = 15 USDT</p>
          <p className="text-lime-300">Level B: 10 × 200 × 3% = 60 USDT</p>
          <p className="text-lime-300">Level C: 10 × 800 × 1% = 80 USDT</p>
          <p className="mt-1">Total daily management earnings: 15 + 60 + 80 = <span className="font-bold">155 USDT</span>.</p>
        </div>
        <p className="text-cyan-300 font-bold">Important note:</p>
        <p>
          If your subordinate has a higher tier than you, you won't receive any task management
          bonuses from them. You can only receive task management rewards from subordinates of
          equal or lower level than you.
        </p>
        <p>
          Intern tasks do not generate any task management bonus. Management bonuses are only
          paid when a subordinate completes tasks as a regular employee (C1 or higher).
        </p>

      </div>
    </div>
  );
}
