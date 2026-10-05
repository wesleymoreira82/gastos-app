export type Category = {
  id: string;
  name: string;
  icon: string; // emoji
  color: string; // hex
  isDefault?: boolean;
};

export type Expense = {
  id: string;
  amount: number; // positive number; always considered expense
  categoryId: string;
  date: string; // ISO yyyy-mm-dd (local)
  description?: string;
  createdAt: string; // ISO timestamp
};

export type Frequency = "mensal" | "semanal" | "anual";

export type FixedExpense = {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  dueDay: number; // 1..31 for mensal/anual; 0..6 for semanal (0 = Dom)
  frequency: Frequency;
  mode: "automatico" | "lembrete";
  createdAt: string;
};
