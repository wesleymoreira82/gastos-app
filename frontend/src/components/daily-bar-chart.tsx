import { useMemo, useState } from "react";
import { View, Text, Pressable } from "react-native";

import { makeStyles, radius, spacing, colors as C } from "@/src/theme";
import { formatBRL, WEEKDAY_SHORT_PT, fromISODate, formatDateShortBR } from "@/src/lib/format";

type Props = {
  // ordered ascending by date
  data: { iso: string; total: number }[];
  onBarPress?: (iso: string, total: number) => void;
};

export function DailyBarChart({ data, onBarPress }: Props) {
  const styles = useStyles();
  const [selected, setSelected] = useState<string | null>(null);

  const max = useMemo(() => Math.max(1, ...data.map((d) => d.total)), [data]);
  const selectedItem = useMemo(
    () => (selected ? data.find((d) => d.iso === selected) : null),
    [selected, data],
  );

  if (!data.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sem dados no período</Text>
      </View>
    );
  }

  // Dynamic label mode: when range is short show weekday, else show dd/mm every N
  const showWeekday = data.length <= 7;
  const labelEvery = data.length <= 7 ? 1 : data.length <= 14 ? 2 : 5;

  return (
    <View style={styles.wrap}>
      <View style={styles.selectionRow}>
        {selectedItem ? (
          <>
            <Text style={styles.selectionLabel}>
              {fromISODate(selectedItem.iso).toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
              })}
            </Text>
            <Text style={styles.selectionValue}>{formatBRL(selectedItem.total)}</Text>
          </>
        ) : (
          <Text style={styles.selectionHint}>Toque numa barra para ver o detalhe</Text>
        )}
      </View>
      <View style={styles.chart}>
        {data.map((d, idx) => {
          const h = max > 0 ? (d.total / max) * 100 : 0;
          const isSel = selected === d.iso;
          const dateObj = fromISODate(d.iso);
          const weekday = WEEKDAY_SHORT_PT[dateObj.getDay()];
          const showLabel = idx % labelEvery === 0 || idx === data.length - 1;
          return (
            <Pressable
              key={d.iso}
              onPress={() => {
                setSelected(d.iso);
                onBarPress?.(d.iso, d.total);
              }}
              style={styles.col}
              testID={`bar-${d.iso}`}
            >
              <View style={styles.barWrap}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(h, 2)}%`,
                      backgroundColor: isSel ? C.brandPrimary : C.error,
                      opacity: d.total === 0 ? 0.25 : 1,
                    },
                  ]}
                />
              </View>
              <Text style={styles.colLabel} numberOfLines={1}>
                {showLabel ? (showWeekday ? weekday : formatDateShortBR(d.iso)) : ""}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  selectionRow: {
    minHeight: 44,
    gap: 2,
  },
  selectionHint: {
    color: colors.muted,
    fontSize: 13,
  },
  selectionLabel: {
    color: colors.muted,
    fontSize: 13,
    textTransform: "capitalize",
  },
  selectionValue: {
    color: colors.onSurface,
    fontSize: 22,
    fontWeight: "700",
  },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 160,
    gap: 4,
  },
  col: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  barWrap: {
    width: "100%",
    height: 130,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "70%",
    minHeight: 2,
    borderTopLeftRadius: radius.sm,
    borderTopRightRadius: radius.sm,
  },
  colLabel: {
    color: colors.muted,
    fontSize: 10,
    textTransform: "capitalize",
  },
  empty: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
  },
  emptyText: {
    color: colors.muted,
  },
}));
