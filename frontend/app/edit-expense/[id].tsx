import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Text, View } from "react-native";

import { ExpenseForm } from "@/src/components/expense-form";
import { useFinance } from "@/src/store/finance";
import { makeStyles } from "@/src/theme";

export default function EditExpenseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { expenses } = useFinance();
  const styles = useStyles();

  const expense = useMemo(() => expenses.find((e) => e.id === id), [expenses, id]);

  if (!expense) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Gasto não encontrado</Text>
      </View>
    );
  }

  return (
    <ExpenseForm
      mode="edit"
      initial={{
        id: expense.id,
        amount: expense.amount,
        categoryId: expense.categoryId,
        date: expense.date,
        description: expense.description,
      }}
    />
  );
}

const useStyles = makeStyles((colors) => ({
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
  },
  emptyText: {
    color: colors.muted,
    fontSize: 14,
  },
}));
