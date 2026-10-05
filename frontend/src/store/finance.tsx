// Finance data store (local-first).
// Everything is persisted via AsyncStorage via @/src/utils/storage.
// Arrays are JSON-stringified because the storage helper only accepts
// primitives (string | number | boolean | null).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { storage } from "@/src/utils/storage";
import { DEFAULT_CATEGORIES } from "@/src/lib/categories";
import { daysAgoISO, todayISO } from "@/src/lib/dates";
import { Category, Expense, FixedExpense } from "@/src/types";

const KEY_EXPENSES = "cf:expenses";
const KEY_CATEGORIES = "cf:categories";
const KEY_FIXED = "cf:fixed";
const KEY_SEEDED = "cf:seeded";

function uid(): string {
  // RFC4122 v4-ish, enough for local ids
  const rand = () =>
    Math.floor(Math.random() * 1e9)
      .toString(36)
      .padStart(6, "0");
  return `${Date.now().toString(36)}-${rand()}${rand()}`;
}

async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  const raw = await storage.getItem(key, "");
  if (!raw || typeof raw !== "string") return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function saveJSON<T>(key: string, value: T): Promise<void> {
  await storage.setItem(key, JSON.stringify(value));
}

async function seedIfNeeded(): Promise<void> {
  const seeded = await storage.getItem(KEY_SEEDED, false);
  if (seeded) return;
  await saveJSON(KEY_CATEGORIES, DEFAULT_CATEGORIES);

  // Build sample expenses for the last 7 days.
  const samples: Omit<Expense, "id" | "createdAt">[] = [
    { amount: 35, categoryId: "cat-alimentacao", date: todayISO(), description: "Almoço" },
    { amount: 22.5, categoryId: "cat-transporte", date: todayISO(), description: "Uber" },
    { amount: 30, categoryId: "cat-mercado", date: todayISO(), description: "Mercado" },
    { amount: 82, categoryId: "cat-mercado", date: daysAgoISO(1), description: "Compras" },
    { amount: 18, categoryId: "cat-alimentacao", date: daysAgoISO(1), description: "Café" },
    { amount: 45, categoryId: "cat-lazer", date: daysAgoISO(2), description: "Cinema" },
    { amount: 120, categoryId: "cat-casa", date: daysAgoISO(3), description: "Conta de luz" },
    { amount: 60, categoryId: "cat-saude", date: daysAgoISO(4), description: "Farmácia" },
    { amount: 15, categoryId: "cat-transporte", date: daysAgoISO(4), description: "Metrô" },
    { amount: 210, categoryId: "cat-roupas", date: daysAgoISO(5), description: "Camisa" },
    { amount: 32, categoryId: "cat-alimentacao", date: daysAgoISO(6), description: "Jantar" },
    { amount: 28, categoryId: "cat-transporte", date: daysAgoISO(6), description: "99" },
  ];
  const expenses: Expense[] = samples.map((s) => ({
    ...s,
    id: uid(),
    createdAt: new Date().toISOString(),
  }));
  await saveJSON(KEY_EXPENSES, expenses);

  const fixed: FixedExpense[] = [
    {
      id: uid(),
      name: "Aluguel",
      amount: 1200,
      categoryId: "cat-casa",
      dueDay: 5,
      frequency: "mensal",
      mode: "lembrete",
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      name: "Internet",
      amount: 100,
      categoryId: "cat-casa",
      dueDay: 10,
      frequency: "mensal",
      mode: "lembrete",
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      name: "Netflix",
      amount: 55,
      categoryId: "cat-assinaturas",
      dueDay: 15,
      frequency: "mensal",
      mode: "lembrete",
      createdAt: new Date().toISOString(),
    },
  ];
  await saveJSON(KEY_FIXED, fixed);
  await storage.setItem(KEY_SEEDED, true);
}

type Store = {
  loading: boolean;
  expenses: Expense[];
  categories: Category[];
  fixed: FixedExpense[];
  reload: () => Promise<void>;
  addExpense: (e: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id" | "createdAt">>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, "id">) => Promise<void>;
  updateCategory: (id: string, patch: Partial<Omit<Category, "id">>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addFixed: (f: Omit<FixedExpense, "id" | "createdAt">) => Promise<void>;
  updateFixed: (id: string, patch: Partial<Omit<FixedExpense, "id" | "createdAt">>) => Promise<void>;
  deleteFixed: (id: string) => Promise<void>;
};

const FinanceContext = createContext<Store | null>(null);

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [fixed, setFixed] = useState<FixedExpense[]>([]);

  const reload = useCallback(async () => {
    const [e, c, f] = await Promise.all([
      loadJSON<Expense[]>(KEY_EXPENSES, []),
      loadJSON<Category[]>(KEY_CATEGORIES, DEFAULT_CATEGORIES),
      loadJSON<FixedExpense[]>(KEY_FIXED, []),
    ]);
    setExpenses(e);
    setCategories(c);
    setFixed(f);
  }, []);

  useEffect(() => {
    (async () => {
      await seedIfNeeded();
      await reload();
      setLoading(false);
    })();
  }, [reload]);

  const addExpense = useCallback(
    async (data: Omit<Expense, "id" | "createdAt">) => {
      const next: Expense = { ...data, id: uid(), createdAt: new Date().toISOString() };
      const updated = [next, ...expenses];
      setExpenses(updated);
      await saveJSON(KEY_EXPENSES, updated);
    },
    [expenses],
  );

  const updateExpense = useCallback(
    async (id: string, patch: Partial<Omit<Expense, "id" | "createdAt">>) => {
      const updated = expenses.map((e) => (e.id === id ? { ...e, ...patch } : e));
      setExpenses(updated);
      await saveJSON(KEY_EXPENSES, updated);
    },
    [expenses],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      const updated = expenses.filter((e) => e.id !== id);
      setExpenses(updated);
      await saveJSON(KEY_EXPENSES, updated);
    },
    [expenses],
  );

  const addCategory = useCallback(
    async (data: Omit<Category, "id">) => {
      const next: Category = { ...data, id: uid() };
      const updated = [...categories, next];
      setCategories(updated);
      await saveJSON(KEY_CATEGORIES, updated);
    },
    [categories],
  );

  const updateCategory = useCallback(
    async (id: string, patch: Partial<Omit<Category, "id">>) => {
      const updated = categories.map((c) => (c.id === id ? { ...c, ...patch } : c));
      setCategories(updated);
      await saveJSON(KEY_CATEGORIES, updated);
    },
    [categories],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const updated = categories.filter((c) => c.id !== id);
      setCategories(updated);
      await saveJSON(KEY_CATEGORIES, updated);
      // Reassign orphan expenses to "Outros" if exists; else first remaining.
      const fallback = updated.find((c) => c.id === "cat-outros") ?? updated[0];
      if (fallback) {
        const reassigned = expenses.map((e) =>
          e.categoryId === id ? { ...e, categoryId: fallback.id } : e,
        );
        setExpenses(reassigned);
        await saveJSON(KEY_EXPENSES, reassigned);
      }
    },
    [categories, expenses],
  );

  const addFixed = useCallback(
    async (data: Omit<FixedExpense, "id" | "createdAt">) => {
      const next: FixedExpense = { ...data, id: uid(), createdAt: new Date().toISOString() };
      const updated = [...fixed, next];
      setFixed(updated);
      await saveJSON(KEY_FIXED, updated);
    },
    [fixed],
  );

  const updateFixed = useCallback(
    async (id: string, patch: Partial<Omit<FixedExpense, "id" | "createdAt">>) => {
      const updated = fixed.map((f) => (f.id === id ? { ...f, ...patch } : f));
      setFixed(updated);
      await saveJSON(KEY_FIXED, updated);
    },
    [fixed],
  );

  const deleteFixed = useCallback(
    async (id: string) => {
      const updated = fixed.filter((f) => f.id !== id);
      setFixed(updated);
      await saveJSON(KEY_FIXED, updated);
    },
    [fixed],
  );

  const value: Store = useMemo(
    () => ({
      loading,
      expenses,
      categories,
      fixed,
      reload,
      addExpense,
      updateExpense,
      deleteExpense,
      addCategory,
      updateCategory,
      deleteCategory,
      addFixed,
      updateFixed,
      deleteFixed,
    }),
    [
      loading,
      expenses,
      categories,
      fixed,
      reload,
      addExpense,
      updateExpense,
      deleteExpense,
      addCategory,
      updateCategory,
      deleteCategory,
      addFixed,
      updateFixed,
      deleteFixed,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): Store {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}

export function useCategoryMap() {
  const { categories } = useFinance();
  return useMemo(() => {
    const map: Record<string, Category> = {};
    for (const c of categories) map[c.id] = c;
    return map;
  }, [categories]);
}

// Aggregation helpers
export function sumInRange(expenses: Expense[], startISO: string, endISO: string): number {
  return expenses
    .filter((e) => e.date >= startISO && e.date <= endISO)
    .reduce((acc, e) => acc + e.amount, 0);
}

export function sumByDate(expenses: Expense[], iso: string): number {
  return expenses.filter((e) => e.date === iso).reduce((acc, e) => acc + e.amount, 0);
}

export function countByDate(expenses: Expense[], iso: string): number {
  return expenses.filter((e) => e.date === iso).length;
}

export function groupByDate(expenses: Expense[]): Record<string, Expense[]> {
  const out: Record<string, Expense[]> = {};
  for (const e of expenses) {
    if (!out[e.date]) out[e.date] = [];
    out[e.date].push(e);
  }
  return out;
}

export function sumByCategory(
  expenses: Expense[],
  startISO?: string,
  endISO?: string,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const e of expenses) {
    if (startISO && e.date < startISO) continue;
    if (endISO && e.date > endISO) continue;
    out[e.categoryId] = (out[e.categoryId] ?? 0) + e.amount;
  }
  return out;
}
