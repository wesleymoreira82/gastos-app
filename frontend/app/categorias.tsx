import { useMemo, useState } from "react";
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

import { AVAILABLE_COLORS, AVAILABLE_ICONS } from "@/src/lib/categories";
import { useFinance } from "@/src/store/finance";
import { Category } from "@/src/types";
import { makeStyles, radius, spacing, colors as C } from "@/src/theme";

export default function CategoriasScreen() {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categories, addCategory, updateCategory, deleteCategory, expenses } = useFinance();

  const [editing, setEditing] = useState<Category | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(AVAILABLE_ICONS[0]);
  const [color, setColor] = useState(AVAILABLE_COLORS[0]);

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const e of expenses) m[e.categoryId] = (m[e.categoryId] ?? 0) + 1;
    return m;
  }, [expenses]);

  function openCreate() {
    setEditing(null);
    setName("");
    setIcon(AVAILABLE_ICONS[0]);
    setColor(AVAILABLE_COLORS[0]);
    setShowCreate(true);
  }

  function openEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setIcon(c.icon);
    setColor(c.color);
    setShowCreate(true);
  }

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) {
      await updateCategory(editing.id, { name: trimmed, icon, color });
    } else {
      await addCategory({ name: trimmed, icon, color });
    }
    setShowCreate(false);
    setEditing(null);
  }

  async function handleDelete() {
    if (!editing) return;
    await deleteCategory(editing.id);
    setShowCreate(false);
    setEditing(null);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.surface }}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <MaterialDesignIcons name="chevron-left" size={24} color={C.onSurface} />
        </Pressable>
        <Text style={styles.title}>Categorias</Text>
        <Pressable onPress={openCreate} style={styles.addBtn} hitSlop={10} testID="cat-add">
          <MaterialDesignIcons name="plus" size={22} color={C.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingBottom: 160,
        }}
      >
        <View style={styles.list}>
          {categories.map((c, idx) => (
            <Pressable
              key={c.id}
              onPress={() => openEdit(c)}
              style={[styles.row, idx > 0 && styles.rowBorder]}
              testID={`cat-${c.id}`}
            >
              <View style={[styles.iconWrap, { backgroundColor: `${c.color}22`, borderColor: `${c.color}55` }]}>
                <Text style={{ fontSize: 20 }}>{c.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowName}>{c.name}</Text>
                <Text style={styles.rowHint}>
                  {counts[c.id] ?? 0} {(counts[c.id] ?? 0) === 1 ? "gasto" : "gastos"}
                </Text>
              </View>
              <MaterialDesignIcons name="chevron-right" size={22} color={C.muted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {showCreate && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheet}
          pointerEvents="auto"
        >
          <View style={[styles.sheetCard, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {editing ? "Editar categoria" : "Nova categoria"}
              </Text>
              <Pressable onPress={() => setShowCreate(false)} hitSlop={10}>
                <MaterialDesignIcons name="close" size={22} color={C.onSurface} />
              </Pressable>
            </View>

            <Text style={styles.lbl}>Nome</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Ex.: Pet, Café…"
              placeholderTextColor={C.muted}
              style={styles.input}
              testID="cat-name"
            />

            <Text style={styles.lbl}>Ícone</Text>
            <View style={styles.iconsGrid}>
              {AVAILABLE_ICONS.map((i) => {
                const active = i === icon;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setIcon(i)}
                    style={[styles.iconBtn, active && styles.iconBtnActive]}
                  >
                    <Text style={{ fontSize: 20 }}>{i}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.lbl}>Cor</Text>
            <View style={styles.colorsRow}>
              {AVAILABLE_COLORS.map((c) => {
                const active = c === color;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setColor(c)}
                    style={[styles.colorDot, { backgroundColor: c }, active && styles.colorDotActive]}
                  />
                );
              })}
            </View>

            <View style={styles.sheetActions}>
              {editing && !editing.isDefault && (
                <Pressable onPress={handleDelete} style={styles.deleteBtn} testID="cat-delete">
                  <Text style={styles.deleteText}>Excluir</Text>
                </Pressable>
              )}
              <Pressable
                onPress={handleSave}
                disabled={!name.trim()}
                style={[styles.saveBtn, !name.trim() && { opacity: 0.4 }]}
                testID="cat-save"
              >
                <Text style={styles.saveText}>Salvar</Text>
              </Pressable>
            </View>
          </View>
          <Pressable style={styles.sheetBackdrop} onPress={() => setShowCreate(false)} />
        </KeyboardAvoidingView>
      )}
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
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
  iconWrap: {
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
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  sheetBackdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    zIndex: -1,
  },
  sheetCard: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: spacing.sm,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  sheetTitle: {
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
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.onSurface,
    fontSize: 15,
  },
  iconsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surfaceTertiary,
  },
  iconBtnActive: {
    borderColor: colors.brandPrimary,
  },
  colorsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "transparent",
  },
  colorDotActive: {
    borderColor: colors.onSurface,
  },
  sheetActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  deleteBtn: {
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
  },
  saveText: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
}));
