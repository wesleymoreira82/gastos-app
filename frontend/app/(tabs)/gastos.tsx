import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { CategoryBadge } from "@/src/components/category-badge";
import { ChipsRow } from "@/src/components/chips-row";
import {
  groupByDate,
  useCategoryMap,
  useFinance,
} from "@/src/store/finance";
import {
  daysAgoISO,
  endOfMonthISO,
  endOfPrevMonthISO,
  startOfMonthISO,
  startOfPrevMonthISO,
  todayISO,
  yesterdayISO,
} from "@/src/lib/dates";
import { formatBRL, labelForDate } from "@/src/lib/format";
import { makeStyles, radius, spacing } from "@/src/theme";

type PeriodKey =
  | "hoje"
  | "ontem"
  | "7d"
  | "30d"
  | "mes"
  | "mesAnt"
  | "tudo";

const PERIODS: { label: string; value: PeriodKey }[] = [
  { label: "Hoje", value: "hoje" },
  { label: "Ontem", value: "ontem" },
  { label: "7 dias", value: "7d" },
  { label: "30 dias", value: "30d" },
  { label: "Este mês", value: "mes" },
  { label: "Mês anterior", value: "mesAnt" },
  { label: "Tudo", value: "tudo" },
];

function periodRange(key: PeriodKey): { start: string; end: string } | null {
  switch (key) {
    case "hoje":
      return { start: todayISO(), end: todayISO() };
    case "ontem":
      return { start: yesterdayISO(), end: yesterdayISO() };
    case "7d":
      return { start: daysAgoISO(6), end: todayISO() };
    case "30d":
      return { start: daysAgoISO(29), end: todayISO() };
    case "mes":
      return { start: startOfMonthISO(), end: endOfMonthISO() };
    case "mesAnt":
      return { start: startOfPrevMonthISO(), end: endOfPrevMonthISO() };
    case "tudo":
      return null;
  }
}

export default function GastosScreen() {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { expenses, categories } = useFinance();
  const catMap = useCategoryMap();

  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [categoryId, setCategoryId] = useState<string>("all");

  const categoryChips = useMemo(
    () => [
      { label: "Todas", value: "all" },
      ...categories.map((c) => ({ label: `${c.icon} ${c.name}`, value: c.id })),
    ],
    [categories],
  );

  const filtered = useMemo(() => {
    const range = periodRange(period);
    return expenses
      .filter((e) => {
        if (range && (e.date < range.start || e.date > range.end)) return false;
        if (categoryId !== "all" && e.categoryId !== categoryId) return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.createdAt < b.createdAt ? 1 : -1));
  }, [expenses, period, categoryId]);

  const total = useMemo(() => filtered.reduce((a, e) => a + e.amount, 0), [filtered]);

  const grouped = useMemo(() => {
    const byDate = groupByDate(filtered);
    const sortedDates = Object.keys(byDate).sort((a, b) => (a < b ? 1 : -1));
    return sortedDates.map((iso) => ({
      iso,
      items: byDate[iso],
      total: byDate[iso].reduce((a, e) => a + e.amount, 0),
    }));
  }, [filtered]);

  return (
    <View style={{ flex: 1 }}>
      {/* Sticky header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <Text style={styles.title}>Gastos</Text>
        <Text style={styles.totalText}>
          Total do período <Text style={styles.totalValue}>{formatBRL(total)}</Text>
        </Text>
      </View>

      <ChipsRow
        items={PERIODS}
        value={period}
        onChange={setPeriod}
        testID="period-chips"
      />
      <ChipsRow
        items={categoryChips}
        value={categoryId}
        onChange={setCategoryId}
        testID="category-chips"
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingTop: spacing.md,
          paddingBottom: spacing.xxxl * 2,
        }}
        showsVerticalScrollIndicator={false}
      >
        {grouped.length === 0 ? (
          <View style={styles.empty}>
            <MaterialDesignIcons name="receipt-text-outline" size={48} color="#A1A1AA" />
            <Text style={styles.emptyTitle}>Nenhum gasto encontrado</Text>
            <Text style={styles.emptySub}>
              Ajuste os filtros ou adicione um gasto pelo botão +
            </Text>
          </View>
        ) : (
          grouped.map((g) => (
            <View key={g.iso} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupLabel}>{labelForDate(g.iso)}</Text>
                <Text style={styles.groupTotal}>{formatBRL(g.total)}</Text>
              </View>
              <View style={styles.card}>
                {g.items.map((e, idx) => {
                  const cat = catMap[e.categoryId];
                  return (
                    <Pressable
                      key={e.id}
                      onPress={() => router.push(`/edit-expense/${e.id}`)}
                      style={[styles.row, idx > 0 && styles.rowBorder]}
                      testID={`list-expense-${e.id}`}
                    >
                      <CategoryBadge
                        bg={cat?.color ?? "#A1A1AA"}
                        icon={cat?.icon ?? "💰"}
                      />
                      <View style={styles.rowBody}>
                        <Text style={styles.rowCat}>{cat?.name ?? "Outros"}</Text>
                        {!!e.description && (
                          <Text style={styles.rowDesc} numberOfLines={1}>
                            {e.description}
                          </Text>
                        )}
                      </View>
                      <Text style={styles.rowAmount}>- {formatBRL(e.amount)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    gap: 4,
  },
  title: {
    color: colors.onSurface,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  totalText: {
    color: colors.muted,
    fontSize: 13,
  },
  totalValue: {
    color: colors.onSurface,
    fontWeight: "700",
  },
  group: {
    marginBottom: spacing.lg,
  },
  groupHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  groupLabel: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  groupTotal: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  rowBorder: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  rowBody: { flex: 1 },
  rowCat: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "600",
  },
  rowDesc: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  rowAmount: {
    color: colors.error,
    fontSize: 15,
    fontWeight: "700",
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "700",
  },
  emptySub: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
  },
}));
