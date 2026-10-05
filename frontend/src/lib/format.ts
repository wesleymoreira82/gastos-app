// Formatting helpers — pt-BR

export function formatBRL(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatBRLShort(value: number): string {
  const n = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(n);
  if (abs >= 1000) {
    return `R$ ${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}k`;
  }
  return formatBRL(n);
}

// Parse a free-form "R$ 1.234,56" or "1234,56" or "1234.56" to number.
export function parseAmount(raw: string): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/[^\d,.-]/g, "");
  // If both separators present, assume "." is thousand and "," is decimal
  if (cleaned.includes(",") && cleaned.includes(".")) {
    const normalized = cleaned.replace(/\./g, "").replace(",", ".");
    const n = parseFloat(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  if (cleaned.includes(",")) {
    const n = parseFloat(cleaned.replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

// Build a currency string from raw digit characters: "1234" -> "R$ 12,34"
export function digitsToBRL(digits: string): string {
  const only = digits.replace(/\D/g, "");
  if (!only) return "R$ 0,00";
  const cents = parseInt(only, 10);
  const value = cents / 100;
  return formatBRL(value);
}

export function digitsToAmount(digits: string): number {
  const only = digits.replace(/\D/g, "");
  if (!only) return 0;
  const cents = parseInt(only, 10);
  return cents / 100;
}

// yyyy-mm-dd local
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map((n) => parseInt(n, 10));
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDateBR(iso: string): string {
  const d = fromISODate(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export function formatDateShortBR(iso: string): string {
  const d = fromISODate(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

export const WEEKDAY_SHORT_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const WEEKDAY_LONG_PT = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];
export const MONTH_PT = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function labelForDate(iso: string): string {
  const today = toISODate(new Date());
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = toISODate(y);
  if (iso === today) return "Hoje";
  if (iso === yesterday) return "Ontem";
  const d = fromISODate(iso);
  const wd = WEEKDAY_LONG_PT[d.getDay()];
  return `${wd} — ${formatDateShortBR(iso)}`;
}
