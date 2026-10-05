// Shared add/edit expense form.
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { useFinance } from "@/src/store/finance";
import {
  digitsToAmount,
  digitsToBRL,
  formatDateBR,
  toISODate,
  fromISODate,
} from "@/src/lib/format";
import { makeStyles, radius, spacing, colors as C } from "@/src/theme";
import { Category } from "@/src/types";

type Props = {
  mode: "create" | "edit";
  initial?: {
    id: string;
    amount: number;
    categoryId: string;
    date: string;
    description?: string;
  };
};

function amountToDigits(a: number): string {
  const cents = Math.round(a * 100);
  return String(cents);
}

export function ExpenseForm({ mode, initial }: Props) {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, addExpense, updateExpense, deleteExpense } = useFinance();

  const [digits, setDigits] = useState(initial ? amountToDigits(initial.amount) : "");
  const [categoryId, setCategoryId] = useState<string>(
    initial?.categoryId ?? categories[0]?.id ?? "",
  );
  const [dateISO, setDateISO] = useState<string>(initial?.date ?? toISODate(new Date()));
  const [description, setDescription] = useState(initial?.description ?? "");

  const amountRef = useRef<TextInput>(null);

  useEffect(() => {
    if (mode === "create") {
      const t = setTimeout(() => amountRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [mode]);

  const amount = digitsToAmount(digits);
  const canSave = amount > 0 && !!categoryId;

  function shiftDate(deltaDays: number) {
    const d = fromISODate(dateISO);
    d.setDate(d.getDate() + deltaDays);
    setDateISO(toISODate(d));
  }

  async function handleSave() {
    if (!canSave) return;
    if (mode === "create") {
      await addExpense({ amount, categoryId, date: dateISO, description: description.trim() });
    } else if (initial) {
      await updateExpense(initial.id, {
        amount,
        categoryId,
        date: dateISO,
        description: description.trim(),
      });
    }
    router.back();
  }

  async function handleDelete() {
    if (!initial) return;
    await deleteExpense(initial.id);
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={10}
          testID="expense-close"
        >
          <MaterialDesignIcons name="close" size={22} color={C.onSurface} />
        </Pressable>
        <Text style={styles.title}>{mode === "create" ? "Novo gasto" : "Editar gasto"}</Text>
        {mode === "edit" ? (
          <Pressable onPress={handleDelete} style={styles.deleteBtn} hitSlop={10} testID="expense-delete">
            <MaterialDesignIcons name="trash-can-outline" size={22} color={C.error} />
          </Pressable>
        ) : (
          <View style={styles.closeBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Amount */}
        <View style={styles.amountBlock}>
          <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit>
            {digitsToBRL(digits)}
          </Text>
          <TextInput
            ref={amountRef}
            value={digits}
            onChangeText={(t) => setDigits(t.replace(/\D/g, ""))}
            keyboardType="number-pad"
            style={styles.hiddenInput}
            placeholder=""
            autoFocus={mode === "create"}
            testID="expense-amount-input"
          />
          <Pressable
            style={styles.focusAmount}
            onPress={() => amountRef.current?.focus()}
            testID="expense-amount-tap"
          />
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categoria</Text>
        <View style={styles.catGrid}>
          {categories.map((c: Category) => {
            const active = c.id === categoryId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[
                  styles.catItem,
                  active && { borderColor: C.brandPrimary, backgroundColor: `${c.color}22` },
                ]}
                testID={`cat-pick-${c.id}`}
              >
                <Text style={styles.catIcon}>{c.icon}</Text>
                <Text style={styles.catName} numberOfLines={1}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Date */}
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.dateRow}>
          <Pressable onPress={() => shiftDate(-1)} style={styles.dateBtn} testID="date-prev">
            <MaterialDesignIcons name="chevron-left" size={22} color={C.onSurface} />
          </Pressable>
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>{formatDateBR(dateISO)}</Text>
            <Text style={styles.dateSub}>
              {dateISO === toISODate(new Date()) ? "Hoje" : "Toque nas setas para ajustar"}
            </Text>
          </View>
          <Pressable
            onPress={() => shiftDate(1)}
            style={styles.dateBtn}
            testID="date-next"
            disabled={dateISO >= toISODate(new Date())}
          >
            <MaterialDesignIcons
              name="chevron-right"
              size={22}
              color={dateISO >= toISODate(new Date()) ? C.muted : C.onSurface}
            />
          </Pressable>
        </View>
        <Pressable
          onPress={() => setDateISO(toISODate(new Date()))}
          style={styles.todayBtn}
          testID="date-today"
        >
          <Text style={styles.todayBtnText}>Usar data de hoje</Text>
        </Pressable>

        {/* Description */}
        <Text style={styles.sectionTitle}>Descrição (opcional)</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Ex.: almoço, gasolina, farmácia…"
          placeholderTextColor={C.muted}
          style={styles.descInput}
          returnKeyType="done"
          testID="expense-description"
        />
      </ScrollView>

      {/* Sticky save */}
      <View style={[styles.saveWrap, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
          testID="expense-save"
        >
          <Text style={styles.saveText}>
            {mode === "create" ? "Adicionar gasto" : "Salvar alterações"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
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
  amountBlock: {
    paddingVertical: spacing.xxxl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    position: "relative",
  },
  amountValue: {
    color: colors.error,
    fontSize: 56,
    fontWeight: "800",
    letterSpacing: -1.2,
    paddingHorizontal: spacing.lg,
  },
  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  focusAmount: {
    ...StyleSheetAbsoluteFill(),
  },
  sectionTitle: {
    color: colors.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  catItem: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: 4,
  },
  catIcon: {
    fontSize: 22,
  },
  catName: {
    color: colors.onSurfaceSecondary,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dateBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  dateDisplay: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  dateText: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "700",
  },
  dateSub: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2,
  },
  todayBtn: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  todayBtnText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: spacing.lg,
  },
  descInput: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.onSurface,
    fontSize: 15,
  },
  saveWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
  },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 16,
    borderRadius: radius.pill,
    alignItems: "center",
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveText: {
    color: colors.onBrandPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
}));

function StyleSheetAbsoluteFill() {
  return { position: "absolute" as const, left: 0, right: 0, top: 0, bottom: 0 };
}
