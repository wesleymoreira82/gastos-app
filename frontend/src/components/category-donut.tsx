import { useMemo } from "react";
import { View, Text } from "react-native";
import Svg, { Circle, G } from "react-native-svg";


import { makeStyles, radius, spacing } from "@/src/theme";
import { formatBRL } from "@/src/lib/format";

type Slice = { id: string; label: string; icon: string; value: number; color: string };

type Props = {
  slices: Slice[];
  size?: number;
};

export function CategoryDonut({ slices, size = 180 }: Props) {
  const styles = useStyles();
  const total = useMemo(() => slices.reduce((acc, s) => acc + s.value, 0), [slices]);
  const stroke = 24;
  const radiusCircle = size / 2 - stroke / 2;
  const circumference = 2 * Math.PI * radiusCircle;

  if (total === 0) {
    return (
      <View style={styles.wrap}>
        <View style={[styles.center, { width: size, height: size }]}>
          <Text style={styles.emptyText}>Sem gastos</Text>
          <Text style={styles.emptyText}>no período</Text>
        </View>
      </View>
    );
  }

  let offset = 0;
  return (
    <View style={styles.wrap}>
      <Svg width={size} height={size}>
        <G transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radiusCircle}
            stroke="#27272A"
            strokeWidth={stroke}
            fill="none"
          />
          {slices.map((s) => {
            const frac = s.value / total;
            const length = circumference * frac;
            const dash = `${length} ${circumference - length}`;
            const el = (
              <Circle
                key={s.id}
                cx={size / 2}
                cy={size / 2}
                r={radiusCircle}
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                fill="none"
                strokeLinecap="butt"
              />
            );
            offset += length;
            return el;
          })}
        </G>
      </Svg>
      <View style={[styles.labelCenter, { width: size, height: size }]} pointerEvents="none">
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatBRL(total)}
        </Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  labelCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalValue: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "700",
    paddingHorizontal: 8,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 13,
  },
}));
