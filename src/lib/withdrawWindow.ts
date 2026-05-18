// TRC-20 withdrawal window: Mon-Sat, 09:00–20:00 UK time (Europe/London)

export const MIN_WITHDRAWAL = 2;
export const WITHDRAWAL_FEE_RATE = 0.08;

export function getUkParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const weekday = parts.find((p) => p.type === "weekday")?.value || "";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  return { weekday, hour, minute };
}

export function isWithdrawWindowOpen(date = new Date()) {
  const { weekday, hour } = getUkParts(date);
  // Withdrawals: Monday–Friday only
  if (weekday === "Sat" || weekday === "Sun") return false;
  return hour >= 9 && hour < 20;
}

// Task availability days by tier (UK time)
export function isTaskDayOpen(tier: string, date = new Date()) {
  const { weekday } = getUkParts(date);
  if (tier === "Intern") return true; // anytime during the 2-day trial
  if (tier === "C1" || tier === "C2") {
    // Monday–Friday
    return weekday !== "Sat" && weekday !== "Sun";
  }
  if (tier === "C3") {
    // Monday–Saturday
    return weekday !== "Sun";
  }
  if (tier === "C4" || tier === "C5") return weekday !== "Sun";
  return true;
}

export function taskDaysLabel(tier: string) {
  if (tier === "C1" || tier === "C2") return "Monday–Friday";
  if (tier === "C3") return "Monday–Saturday";
  return "Monday–Saturday";
}

export function ukClockLabel(date = new Date()) {
  const { weekday, hour, minute } = getUkParts(date);
  return `${weekday} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} UK`;
}

export function calcWithdrawal(amount: number) {
  const fee = +(amount * WITHDRAWAL_FEE_RATE).toFixed(2);
  const net = +(amount - fee).toFixed(2);
  return { fee, net };
}
