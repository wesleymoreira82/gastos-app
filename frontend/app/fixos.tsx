import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { useCategoryMap, useFinance } from "@/src/store/finance";
import { makeStyles, radius, spacing, colors as C } from "@/src/theme";
import { formatBRL } from "@/src/lib/format";
import { FixedExpense } from "@/src/types";

const FREQ_LABEL: Record<FixedExpense["frequency"], string> = {
  mensal: "Mensal",
  semanal: "Semanal",
  anual: "Anual",
};

export default function FixosScreen() {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fixed, deleteFixed } = useFinance();
  const catMap = useCategoryMap();

  const total = useMemo(
    () => fixed.filter((f) => f.frequency === "mensal").reduce((a, f) => a + f.amount, 0),
    [fixed],
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
          <MaterialDesignIcons name="chevron-left" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={styles.title}>Gastos fixos</Text>
        <Pressable
          onPress={() => router.push("/fixos-new")}
          style={styles.iconBtn}
          hitSlop={10}
          testID="fixo-add"
        >
          <MaterialDesignIcons name="plus" size={22} color={C.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: 160,
        }}
      >
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total mensal</Text>
          <Text style={styles.totalValue}>{formatBRL(total)}</Text>
        </View>

        {fixed.length === 0 ? (
          <View style={styles.empty}>
            <MaterialDesignIcons name="repeat" size={40} color={C.muted} />
            <Text style={styles.emptyTitle}>Nenhum gasto fixo cadastrado</Text>
            <Text style={styles.emptySub}>
              Adicione despesas recorrentes como aluguel, internet, assinaturas.
            </Text>
            <Pressable
              onPress={() => router.push("/fixos-new")}
              style={styles.emptyBtn}
              testID="fixo-empty-add"
            >
              <Text style={styles.emptyBtnText}>Adicionar gasto fixo</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {fixed.map((f, idx) => {
              const cat = catMap[f.categoryId];
              return (
                <View key={f.id} style={[styles.row, idx > 0 && styles.rowBorder]}>
                  <View
                    style={[
                      styles.catIcon,
                      { backgroundColor: `${cat?.color ?? "#A1A1AA"}22`, borderColor: `${cat?.color ?? "#A1A1AA"}55` },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{cat?.icon ?? "💰"}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowName}>{f.name}</Text>
                    <Text style={styles.rowHint}>
                      {FREQ_LABEL[f.frequency]} · Dia {f.dueDay} ·{" "}
                      {f.mode === "automatico" ? "Automático" : "Lembrete"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: spacing.sm }}>
                    <Text style={styles.rowAmount}>{formatBRL(f.amount)}</Text>
                    <Pressable
                      onPress={() => deleteFixed(f.id)}
                      hitSlop={8}
                      testID={`fixo-delete-${f.id}`}
                    >
                      <MaterialDesignIcons name="trash-can-outline" size={18} color={C.muted} />
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: "700",
  },
  totalCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: 4,
  },
  totalLabel: {
    color: colors.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
  },
  totalValue: {
    color: colors.onSurface,
    fontSize: 28,
    fontWeight: "800",
  },
  list: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  rowBorder: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  rowName: {
    color: colors.onSurface,
    fontSize: 15,
    fontWeight: "600",
  },
  rowHint: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 2,
  },
  rowAmount: {
    color: colors.onSurface,
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
    fontSize: 15,
    fontWeight: "700",
  },
  emptySub: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
  emptyBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 12,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  emptyBtnText: {
    color: colors.onBrandPrimary,
    fontWeight: "700",
    fontSize: 14,
  },
}));
