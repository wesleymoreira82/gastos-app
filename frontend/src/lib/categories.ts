import { Category } from "../types";

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "cat-alimentacao", name: "Alimentação", icon: "🍔", color: "#F97316", isDefault: true },
  { id: "cat-mercado", name: "Mercado", icon: "🛒", color: "#22C55E", isDefault: true },
  { id: "cat-transporte", name: "Transporte", icon: "🚗", color: "#3B82F6", isDefault: true },
  { id: "cat-casa", name: "Casa", icon: "🏠", color: "#A855F7", isDefault: true },
  { id: "cat-cartao", name: "Cartão", icon: "💳", color: "#EC4899", isDefault: true },
  { id: "cat-lazer", name: "Lazer", icon: "🎮", color: "#06B6D4", isDefault: true },
  { id: "cat-roupas", name: "Roupas", icon: "👕", color: "#8B5CF6", isDefault: true },
  { id: "cat-saude", name: "Saúde", icon: "💊", color: "#EF4444", isDefault: true },
  { id: "cat-assinaturas", name: "Assinaturas", icon: "📱", color: "#14B8A6", isDefault: true },
  { id: "cat-educacao", name: "Educação", icon: "📚", color: "#F59E0B", isDefault: true },
  { id: "cat-filhos", name: "Filhos", icon: "👶", color: "#F472B6", isDefault: true },
  { id: "cat-outros", name: "Outros", icon: "💰", color: "#A1A1AA", isDefault: true },
];

export const AVAILABLE_ICONS = [
  "🍔", "🛒", "🚗", "🏠", "💳", "🎮", "👕", "💊", "📱", "📚", "👶", "💰",
  "✈️", "🎁", "🐶", "☕", "⛽", "🍺", "🎬", "🎵", "💼", "🏥", "🏦", "🎓",
  "🧾", "💻", "🔧", "🎨", "⚽", "🏋️",
];

export const AVAILABLE_COLORS = [
  "#F97316", "#22C55E", "#3B82F6", "#A855F7", "#EC4899", "#06B6D4",
  "#8B5CF6", "#EF4444", "#14B8A6", "#F59E0B", "#F472B6", "#A1A1AA",
  "#84CC16", "#0EA5E9", "#D946EF",
];
