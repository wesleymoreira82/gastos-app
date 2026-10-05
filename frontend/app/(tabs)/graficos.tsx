import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryDonut } from "@/src/components/category-donut";
import { DailyBarChart } from "@/src/components/daily-bar-chart";
import { SegmentedControl } from "@/src/components/segmented-control";
import {
  sumByCategory,
  sumByDate,
  sumInRange,
  useCategoryMap,
  useFinance,
} from "@/src/store/finance";
import {
  daysAgoISO,
  daysInRange,
  endOfMonthISO,
  endOfPrevMonthISO,
  endOfPrevWeekISO,
  endOfWeekISO,
  startOfMonthISO,
  startOfPrevMonthISO,
  startOfPrevWeekISO,
  startOfWeekISO,
  todayISO,
  yesterdayISO,
} from "@/src/lib/dates";
import { formatBRL, WEEKDAY_LONG_PT, fromISODate } from "@/src/lib/format";
import { makeStyles, radius, spacing } from "@/src/theme";

type RangeKey = "7d" | "14d" | "30d";
type ComparativeKey = "dia" | "semana" | "mes";

export default function GraficosScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { expenses } = useFinance();
  const catMap = useCategoryMap();

  const [range, setRange] = useState<RangeKey>("7d");
  const [comparative, setComparative] = useState<ComparativeKey>("semana");

  const days = range === "7d" ? 7 : range === "14d" ? 14 : 30;
  const start = daysAgoISO(days - 1);
  const end = todayISO();

  const dailyData = useMemo(() => {
    const all = daysInRange(start, end);
    return all.map((iso) => ({ iso, total: sumByDate(expenses, iso) }));
  }, [expenses, start, end]);

  const totalPeriod = useMemo(() => sumInRange(expenses, start, end), [expenses, start, end]);
  const avgPeriod = totalPeriod / Math.max(1, days);
  const maxDay = useMemo(() => {
    let m = { iso: "", total: 0 };
    for (const d of dailyData) if (d.total > m.total) m = d;
    return m;
  }, [dailyData]);

  const catSums = useMemo(() => sumByCategory(expenses, start, end), [expenses, start, end]);
  const catSlices = useMemo(() => {
    const entries = Object.entries(catSums)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
    return entries.map(([id, value]) => {
      const cat = catMap[id];
      return {
        id,
        label: cat?.name ?? "Outros",
        icon: cat?.icon ?? "💰",
        color: cat?.color ?? "#A1A1AA",
        value,
      };
    });
  }, [catSums, catMap]);
  const totalCat = catSlices.reduce((a, s) => a + s.value, 0);

  // Comparative
  const comp = useMemo(() => {
    if (comparative === "dia") {
      const curT = sumByDate(expenses, todayISO());
      const prevT = sumByDate(expenses, yesterdayISO());
      return {
        label: "Hoje",
        prevLabel: "Ontem",
        current: curT,
        previous: prevT,
      };
    }
    if (comparative === "semana") {
      const curT = sumInRange(expenses, startOfWeekISO(), endOfWeekISO());
      const prevT = sumInRange(expenses, startOfPrevWeekISO(), endOfPrevWeekISO());
      return {
        label: "Esta semana",
        prevLabel: "Semana anterior",
        current: curT,
        previous: prevT,
      };
    }
    const curT = sumInRange(expenses, startOfMonthISO(), endOfMonthISO());
    const prevT = sumInRange(expenses, startOfPrevMonthISO(), endOfPrevMonthISO());
    return {
      label: "Este mês",
      prevLabel: "Mês anterior",
      current: curT,
      previous: prevT,
    };
  }, [expenses, comparative]);

  const diffPct = useMemo(() => {
    if (comp.previous === 0) return comp.current > 0 ? 100 : 0;
    return ((comp.current - comp.previous) / comp.previous) * 100;
  }, [comp]);

  // Best day of week over last 30d
  const weekdayStats = useMemo(() => {
    const totals = [0, 0, 0, 0, 0, 0, 0];
    const from = daysAgoISO(29);
    for (const e of expenses) {
      if (e.date < from || e.date > end) continue;
      const d = fromISODate(e.date).getDay();
      totals[d] += e.amount;
    }
    let max = { day: 0, total: 0 };
    for (let i = 0; i < 7; i++) if (totals[i] > max.total) max = { day: i, total: totals[i] };
    return max;
  }, [expenses, end]);

  const topCategory = catSlices[0];

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{
        paddingTop: insets.top + spacing.lg,
        paddingBottom: spacing.xxxl * 2,
        paddingHorizontal: spacing.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Gráficos</Text>

      {/* Daily bar chart */}
      <View style={{ marginTop: spacing.md }}>
        <SegmentedControl
          items={[
            { label: "7 dias", value: "7d" },
            { label: "14 dias", value: "14d" },
            { label: "30 dias", value: "30d" },
          ]}
          value={range}
          onChange={setRange}
          testID="range-segment"
        />
      </View>

      <View style={{ marginTop: spacing.md }}>
        <DailyBarChart data={dailyData} />
      </View>

      {/* Period summary */}
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{formatBRL(totalPeriod)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.statLabel}>Média/dia</Text>
            <Text style={styles.statValue}>{formatBRL(avgPeriod)}</Text>
          </View>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCell}>
            <Text style={styles.statLabel}>Maior gasto do dia</Text>
            <Text style={styles.statValue}>{formatBRL(maxDay.total)}</Text>
          </View>
          <View style={styles.summaryCell}>
            <Text style={styles.statLabel}>Dia +gasto</Text>
            <Text style={styles.statValue}>
              {weekdayStats.total > 0 ? WEEKDAY_LONG_PT[weekdayStats.day].split("-")[0] : "—"}
            </Text>
          </View>
        </View>
      </View>

      {/* Comparative */}
      <Text style={styles.sectionTitle}>Comparativo</Text>
      <View style={{ marginBottom: spacing.md }}>
        <SegmentedControl
          items={[
            { label: "Dia", value: "dia" },
            { label: "Semana", value: "semana" },
            { label: "Mês", value: "mes" },
          ]}
          value={comparative}
          onChange={setComparative}
          testID="comparative-segment"
        />
      </View>
      <View style={styles.compCard}>
        <View style={styles.compRow}>
          <View style={styles.compCell}>
            <Text style={styles.statLabel}>{comp.label}</Text>
            <Text style={styles.compValue}>{formatBRL(comp.current)}</Text>
          </View>
          <View style={styles.compCell}>
            <Text style={styles.statLabel}>{comp.prevLabel}</Text>
            <Text style={styles.compValuePrev}>{formatBRL(comp.previous)}</Text>
          </View>
        </View>
        <View style={styles.compDiff}>
          <Text
            style={[
              styles.compDiffText,
              { color: diffPct > 0 ? "#EF4444" : diffPct < 0 ? "#22C55E" : "#A1A1AA" },
            ]}
          >
            {comp.current === comp.previous
              ? "Mesmo valor do período anterior"
              : `${diffPct > 0 ? "↑" : "↓"} Você gastou ${Math.abs(diffPct).toFixed(1)}% ${
                  diffPct > 0 ? "a mais" : "a menos"
                }`}
          </Text>
        </View>
      </View>

      {/* Category donut */}
      <Text style={styles.sectionTitle}>Gastos por categoria</Text>
      <View style={{ alignItems: "center" }}>
        <CategoryDonut slices={catSlices} />
      </View>
      {catSlices.length > 0 && (
        <View style={styles.catList}>
          {catSlices.map((s) => {
            const pct = totalCat > 0 ? (s.value / totalCat) * 100 : 0;
            return (
              <Pressable key={s.id} style={styles.catRow} testID={`cat-row-${s.id}`}>
                <View style={[styles.catDot, { backgroundColor: s.color }]} />
                <Text style={styles.catName} numberOfLines={1}>
                  {s.icon} {s.label}
                </Text>
                <Text style={styles.catAmount}>{formatBRL(s.value)}</Text>
                <Text style={styles.catPct}>{pct.toFixed(0)}%</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {topCategory && (
        <Text style={styles.insight}>
          {topCategory.label} representa{" "}
          {((topCategory.value / Math.max(1, totalCat)) * 100).toFixed(0)}% dos seus gastos no
          período.
        </Text>
      )}
    </ScrollView>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.surface },
  title: {
    color: colors.onSurface,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  summary: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  summaryCell: {
    flex: 1,
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
    fontSize: 17,
    fontWeight: "700",
  },
  compCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  compRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  compCell: {
    flex: 1,
    gap: 4,
  },
  compValue: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: "800",
  },
  compValuePrev: {
    color: colors.muted,
    fontSize: 22,
    fontWeight: "700",
  },
  compDiff: {
    paddingTop: spacing.sm,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  compDiffText: {
    fontSize: 14,
    fontWeight: "700",
  },
  catList: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  catRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  catDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  catName: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "600",
  },
  catAmount: {
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "700",
    marginRight: spacing.sm,
  },
  catPct: {
    color: colors.muted,
    fontSize: 12,
    width: 36,
    textAlign: "right",
  },
  insight: {
    color: colors.muted,
    marginTop: spacing.md,
    fontSize: 13,
    lineHeight: 18,
  },
}));
