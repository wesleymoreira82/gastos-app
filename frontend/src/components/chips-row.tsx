import { ScrollView, Text, Pressable, View } from "react-native";

import { makeStyles, radius, spacing } from "@/src/theme";

export type ChipItem<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  items: ChipItem<T>[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
};

export function ChipsRow<T extends string>({ items, value, onChange, testID }: Props<T>) {
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
        testID={testID}
      >
        {items.map((it) => {
          const active = it.value === value;
          return (
            <Pressable
              key={it.value}
              onPress={() => onChange(it.value)}
              style={[styles.chip, active && styles.chipActive]}
              testID={`${testID}-${it.value}`}
            >
              <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    height: 56,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  label: {
    color: colors.onSurfaceSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  labelActive: {
    color: colors.onBrandPrimary,
    fontWeight: "700",
  },
}));
