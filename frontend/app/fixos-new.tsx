import { useRef, useState } from "react";
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
import { digitsToAmount, digitsToBRL } from "@/src/lib/format";
import { makeStyles, radius, spacing, colors as C } from "@/src/theme";
import { Frequency } from "@/src/types";

const FREQ: { label: string; value: Frequency }[] = [
  { label: "Mensal", value: "mensal" },
  { label: "Semanal", value: "semanal" },
  { label: "Anual", value: "anual" },
];

export default function FixosNewScreen() {
  const styles = useStyles();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { categories, addFixed } = useFinance();

  const [name, setName] = useState("");
  const [digits, setDigits] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [frequency, setFrequency] = useState<Frequency>("mensal");
  const [dueDay, setDueDay] = useState<number>(5);
  const [mode, setMode] = useState<"automatico" | "lembrete">("lembrete");
  const nameRef = useRef<TextInput>(null);

  const amount = digitsToAmount(digits);
  const canSave = name.trim().length > 0 && amount > 0 && !!categoryId;
  const maxDueDay = frequency === "semanal" ? 6 : 31;

  async function handleSave() {
    if (!canSave) return;
    await addFixed({
      name: name.trim(),
      amount,
      categoryId,
      frequency,
      dueDay: Math.min(dueDay, maxDueDay),
      mode,
    });
    router.back();
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.surface }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn} hitSlop={10}>
          <MaterialDesignIcons name="close" size={22} color={C.onSurface} />
        </Pressable>
        <Text style={styles.title}>Novo gasto fixo</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lbl}>Nome</Text>
        <TextInput
          ref={nameRef}
          value={name}
          onChangeText={setName}
          placeholder="Ex.: Aluguel, Netflix…"
          placeholderTextColor={C.muted}
          style={styles.input}
          testID="fixo-name"
        />

        <Text style={styles.lbl}>Valor</Text>
        <View style={styles.amountWrap}>
          <Text style={styles.amountText}>{digitsToBRL(digits)}</Text>
          <TextInput
            value={digits}
            onChangeText={(t) => setDigits(t.replace(/\D/g, ""))}
            keyboardType="number-pad"
            style={styles.hidden}
            testID="fixo-amount"
          />
          <Pressable
            style={styles.amountPressable}
            onPress={() => {
              /* input focus not needed on web but keeps touch area */
            }}
          />
        </View>

        <Text style={styles.lbl}>Categoria</Text>
        <View style={styles.catGrid}>
          {categories.map((c) => {
            const active = c.id === categoryId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[
                  styles.catItem,
                  active && { borderColor: C.brandPrimary, backgroundColor: `${c.color}22` },
                ]}
                testID={`fixo-cat-${c.id}`}
              >
                <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                <Text style={styles.catName} numberOfLines={1}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.lbl}>Frequência</Text>
        <View style={styles.row}>
          {FREQ.map((f) => {
            const active = f.value === frequency;
            return (
              <Pressable
                key={f.value}
                onPress={() => setFrequency(f.value)}
                style={[styles.pill, active && styles.pillActive]}
                testID={`fixo-freq-${f.value}`}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.lbl}>
          {frequency === "semanal" ? "Dia da semana (0 = Dom, 6 = Sáb)" : "Dia de vencimento"}
        </Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setDueDay(Math.max(frequency === "semanal" ? 0 : 1, dueDay - 1))}
            style={styles.pillSm}
          >
            <MaterialDesignIcons name="minus" size={18} color={C.onSurface} />
          </Pressable>
          <View style={styles.dueDay}>
            <Text style={styles.dueDayText}>{Math.min(dueDay, maxDueDay)}</Text>
          </View>
          <Pressable
            onPress={() => setDueDay(Math.min(maxDueDay, dueDay + 1))}
            style={styles.pillSm}
          >
            <MaterialDesignIcons name="plus" size={18} color={C.onSurface} />
          </Pressable>
        </View>

        <Text style={styles.lbl}>Modo</Text>
        <View style={styles.row}>
          <Pressable
            onPress={() => setMode("lembrete")}
            style={[styles.pill, mode === "lembrete" && styles.pillActive]}
            testID="fixo-mode-lembrete"
          >
            <Text style={[styles.pillText, mode === "lembrete" && styles.pillTextActive]}>
              Lembrete
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode("automatico")}
            style={[styles.pill, mode === "automatico" && styles.pillActive]}
            testID="fixo-mode-auto"
          >
            <Text style={[styles.pillText, mode === "automatico" && styles.pillTextActive]}>
              Automático
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={[styles.saveWrap, { paddingBottom: insets.bottom + spacing.md }]}>
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[styles.saveBtn, !canSave && { opacity: 0.4 }]}
          testID="fixo-save"
        >
          <Text style={styles.saveText}>Salvar gasto fixo</Text>
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
  lbl: {
    color: colors.muted,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    fontWeight: "600",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.onSurface,
    fontSize: 15,
  },
  amountWrap: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: "center",
    position: "relative",
  },
  amountText: {
    color: colors.onSurface,
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  hidden: { position: "absolute", width: 1, height: 1, opacity: 0 },
  amountPressable: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0 },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  catItem: {
    width: "22%",
    aspectRatio: 1.2,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    padding: 4,
  },
  catName: {
    color: colors.onSurfaceSecondary,
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  pill: {
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  pillText: {
    color: colors.onSurfaceSecondary,
    fontSize: 13,
    fontWeight: "600",
  },
  pillTextActive: {
    color: colors.onBrandPrimary,
    fontWeight: "700",
  },
  pillSm: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  dueDay: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  dueDayText: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: "700",
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
  saveText: {
    color: colors.onBrandPrimary,
    fontSize: 16,
    fontWeight: "800",
  },
}));
