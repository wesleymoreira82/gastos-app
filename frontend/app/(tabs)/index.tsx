import { useMemo } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { CategoryBadge } from "@/src/components/category-badge";
import {
  countByDate,
  sumByDate,
  sumInRange,
  useCategoryMap,
  useFinance,
} from "@/src/store/finance";
import {
  daysAgoISO,
  endOfMonthISO,
  startOfMonthISO,
  todayISO,
  yesterdayISO,
} from "@/src/lib/dates";
import { formatBRL, formatDateBR } from "@/src/lib/format";
import { makeStyles, radius, spacing } from "@/src/theme";

export default function HomeScreen() {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { expenses, loading } = useFinance();
  const catMap = useCategoryMap();

  const today = todayISO();
  const yesterday = yesterdayISO();
  const monthStart = startOfMonthISO();
  const monthEnd = endOfMonthISO();

  const totalToday = useMemo(() => sumByDate(expenses, today), [expenses, today]);
  const countToday = useMemo(() => countByDate(expenses, today), [expenses, today]);
  const totalYesterday = useMemo(() => sumByDate(expenses, yesterday), [expenses, yesterday]);
  const totalMonth = useMemo(
    () => sumInRange(expenses, monthStart, monthEnd),
    [expenses, monthStart, monthEnd],
  );

  const dailyAvg = useMemo(() => {
    const now = new Date();
    const todayDate = now.getDate();
    return totalMonth / Math.max(1, todayDate);
  }, [totalMonth]);

  const todayExpenses = useMemo(
    () =>
      expenses
        .filter((e) => e.date === today)
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [expenses, today],
  );

  const diffVsYesterday = totalToday - totalYesterday;
  const insight = useMemo(() => {
    if (totalToday === 0 && totalYesterday === 0) return null;
    if (totalYesterday === 0 && totalToday > 0) {
      return `Você gastou ${formatBRL(totalToday)} hoje. Ontem foi R$ 0,00.`;
    }
    if (diffVsYesterday > 0) {
      return `Você gastou ${formatBRL(diffVsYesterday)} a mais hoje do que ontem.`;
    }
    if (diffVsYesterday < 0) {
      return `Você gastou ${formatBRL(Math.abs(diffVsYesterday))} a menos hoje do que ontem.`;
    }
    return "Você gastou o mesmo valor que ontem.";
  }, [totalToday, totalYesterday, diffVsYesterday]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color="#FFFFFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.xl,
        paddingBottom: spacing.xxxl * 3,
        paddingHorizontal: spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero} testID="home-hero">
        <Text style={styles.heroLabel}>Hoje</Text>
        <Text style={styles.heroSub}>Você gastou</Text>
        <Text style={styles.heroAmount} testID="home-today-amount" adjustsFontSizeToFit numberOfLines={1}>
          {formatBRL(totalToday)}
        </Text>
        {insight && <Text style={styles.insight}>{insight}</Text>}
      </View>

      {/* Mini stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Este mês</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatBRL(totalMonth)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Média diária</Text>
          <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
            {formatBRL(dailyAvg)}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Gastos hoje</Text>
          <Text style={styles.statValue}>{countToday}</Text>
        </View>
      </View>

      {/* Today list */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Hoje — {formatDateBR(today).slice(0, 5)}</Text>
        <Pressable onPress={() => router.push("/gastos")} hitSlop={10}>
          <Text style={styles.listAction}>Ver tudo</Text>
        </Pressable>
      </View>

      {todayExpenses.length === 0 ? (
        <View style={styles.empty}>
          <MaterialDesignIcons name="receipt-text-outline" size={40} color="#A1A1AA" />
          <Text style={styles.emptyTitle}>Nenhum gasto hoje</Text>
          <Text style={styles.emptySub}>
            Toque no botão + para registrar um gasto em segundos.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {todayExpenses.map((e) => {
            const cat = catMap[e.categoryId];
            return (
              <Pressable
                key={e.id}
                onPress={() => router.push(`/edit-expense/${e.id}`)}
                style={styles.row}
                testID={`expense-row-${e.id}`}
              >
                <CategoryBadge bg={cat?.color ?? "#A1A1AA"} icon={cat?.icon ?? "💰"} />
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
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total hoje</Text>
            <Text style={styles.totalValue}>{formatBRL(totalToday)}</Text>
          </View>
        </View>
      )}

      {/* Last 7 days quick stats */}
      <Last7Panel />
    </ScrollView>
  );
}

function Last7Panel() {
  const styles = useStyles();
  const { expenses } = useFinance();
  const data = useMemo(() => {
    const from = daysAgoISO(6);
    const to = todayISO();
    const total = sumInRange(expenses, from, to);
    const avg = total / 7;
    let maxDay = { iso: "", total: 0 };
    const byDate: Record<string, number> = {};
    for (const e of expenses) {
      if (e.date < from || e.date > to) continue;
      byDate[e.date] = (byDate[e.date] ?? 0) + e.amount;
    }
    for (const [iso, t] of Object.entries(byDate)) {
      if (t > maxDay.total) maxDay = { iso, total: t };
    }
    return { total, avg, maxDay };
  }, [expenses]);

  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Últimos 7 dias</Text>
      <View style={styles.panelRow}>
        <View style={styles.panelCell}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.panelValue}>{formatBRL(data.total)}</Text>
        </View>
        <View style={styles.panelCell}>
          <Text style={styles.statLabel}>Média/dia</Text>
          <Text style={styles.panelValue}>{formatBRL(data.avg)}</Text>
        </View>
      </View>
      {data.maxDay.iso ? (
        <Text style={styles.panelFoot}>
          Maior gasto: {formatBRL(data.maxDay.total)} em {formatDateBR(data.maxDay.iso).slice(0, 5)}
        </Text>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.surface },
  loading: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  hero: {
    gap: 4,
    marginBottom: spacing.xl,
  },
  heroLabel: {
    color: colors.muted,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  heroSub: {
    color: colors.muted,
    fontSize: 14,
  },
  heroAmount: {
    color: colors.error,
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -1.2,
    marginTop: spacing.xs,
  },
  insight: {
    color: colors.onSurfaceSecondary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
  },
  statValue: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  listTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "700",
  },
  listAction: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  list: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  rowBody: {
    flex: 1,
  },
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
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 4,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  totalValue: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "800",
  },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: spacing.xxl,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
  },
  emptyTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "700",
  },
  emptySub: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  panel: {
    marginTop: spacing.xl,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  panelTitle: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "700",
  },
  panelRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  panelCell: {
    flex: 1,
    gap: 4,
  },
  panelValue: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "700",
  },
  panelFoot: {
    color: colors.muted,
    fontSize: 12,
  },
}));
