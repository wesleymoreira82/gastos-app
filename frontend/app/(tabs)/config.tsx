import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { useFinance } from "@/src/store/finance";
import { makeStyles, radius, spacing } from "@/src/theme";
import { formatBRL } from "@/src/lib/format";
import {
  endOfMonthISO,
  startOfMonthISO,
} from "@/src/lib/dates";
import { sumInRange } from "@/src/store/finance";

export default function ConfigScreen() {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { expenses, categories, fixed } = useFinance();

  const monthVariable = sumInRange(expenses, startOfMonthISO(), endOfMonthISO());
  const monthFixed = fixed.reduce((a, f) => (f.frequency === "mensal" ? a + f.amount : a), 0);
  const total = monthVariable + monthFixed;
  const fixedPct = total > 0 ? (monthFixed / total) * 100 : 0;

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
      <Text style={styles.title}>Configurações</Text>

      {/* Summary panel */}
      <View style={styles.summary} testID="config-summary">
        <Text style={styles.summaryHeader}>Gastos deste mês</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gastos fixos</Text>
          <Text style={styles.summaryValue}>{formatBRL(monthFixed)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Gastos variáveis</Text>
          <Text style={styles.summaryValue}>{formatBRL(monthVariable)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.summaryTotal]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{formatBRL(total)}</Text>
        </View>
        {total > 0 && (
          <Text style={styles.summaryHint}>
            Fixos representam {fixedPct.toFixed(0)}% dos gastos deste mês
          </Text>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <Row
          icon="repeat"
          label="Gastos fixos"
          hint={`${fixed.length} cadastrados`}
          onPress={() => router.push("/fixos")}
          testID="menu-fixos"
        />
        <Row
          icon="shape-outline"
          label="Categorias"
          hint={`${categories.length} categorias`}
          onPress={() => router.push("/categorias")}
          testID="menu-categorias"
        />
      </View>

      <Text style={styles.foot}>Controle Financeiro v1.0 — Dados salvos no seu dispositivo.</Text>
    </ScrollView>
  );
}

function Row({
  icon,
  label,
  hint,
  onPress,
  testID,
}: {
  icon: string;
  label: string;
  hint?: string;
  onPress: () => void;
  testID?: string;
}) {
  const styles = useStyles();
  return (
    <Pressable style={styles.row} onPress={onPress} testID={testID}>
      <View style={styles.rowIcon}>
        <MaterialDesignIcons name={icon as never} size={22} color="#FAFAFA" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <MaterialDesignIcons name="chevron-right" size={22} color="#A1A1AA" />
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  scroll: { flex: 1, backgroundColor: colors.surface },
  title: {
    color: colors.onSurface,
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: spacing.lg,
  },
  summary: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  summaryHeader: {
    color: colors.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: colors.onSurfaceSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "600",
  },
  summaryTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  summaryTotalLabel: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "700",
  },
  summaryTotalValue: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "800",
  },
  summaryHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  menu: {
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
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.brandSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "600",
  },
  rowHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  foot: {
    color: colors.muted,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.xl,
  },
}));
