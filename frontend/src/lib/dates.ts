import { toISODate } from "./format";

export function todayISO(): string {
  return toISODate(new Date());
}

export function yesterdayISO(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toISODate(d);
}

export function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

export function startOfMonthISO(ref: Date = new Date()): string {
  return toISODate(new Date(ref.getFullYear(), ref.getMonth(), 1));
}

export function endOfMonthISO(ref: Date = new Date()): string {
  return toISODate(new Date(ref.getFullYear(), ref.getMonth() + 1, 0));
}

export function startOfPrevMonthISO(ref: Date = new Date()): string {
  return toISODate(new Date(ref.getFullYear(), ref.getMonth() - 1, 1));
}

export function endOfPrevMonthISO(ref: Date = new Date()): string {
  return toISODate(new Date(ref.getFullYear(), ref.getMonth(), 0));
}

// Monday-based week start
export function startOfWeekISO(ref: Date = new Date()): string {
  const d = new Date(ref);
  const day = d.getDay(); // 0 Sun..6 Sat
  const diff = (day + 6) % 7; // days since Monday
  d.setDate(d.getDate() - diff);
  return toISODate(d);
}

export function endOfWeekISO(ref: Date = new Date()): string {
  const d = new Date(ref);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff + 6);
  return toISODate(d);
}

export function startOfPrevWeekISO(ref: Date = new Date()): string {
  const d = new Date(ref);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff - 7);
  return toISODate(d);
}

export function endOfPrevWeekISO(ref: Date = new Date()): string {
  const d = new Date(ref);
  const day = d.getDay();
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff - 1);
  return toISODate(d);
}

export function daysInRange(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const cur = new Date(start);
  while (cur <= end) {
    out.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function daysBetween(startISO: string, endISO: string): number {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  const start = new Date(sy, sm - 1, sd).getTime();
  const end = new Date(ey, em - 1, ed).getTime();
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}
