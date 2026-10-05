import { View, Text, Pressable } from "react-native";

import { makeStyles, radius, spacing } from "@/src/theme";

type Item<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  items: Item<T>[];
  value: T;
  onChange: (v: T) => void;
  testID?: string;
};

export function SegmentedControl<T extends string>({ items, value, onChange, testID }: Props<T>) {
  const styles = useStyles();
  return (
    <View style={styles.row} testID={testID}>
      {items.map((it) => {
        const active = it.value === value;
        return (
          <Pressable
            key={it.value}
            onPress={() => onChange(it.value)}
            style={[styles.item, active && styles.itemActive]}
            testID={`${testID}-${it.value}`}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: "row",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.pill,
    padding: 4,
    gap: 4,
  },
  item: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.pill,
  },
  itemActive: {
    backgroundColor: colors.brandPrimary,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  labelActive: {
    color: colors.onBrandPrimary,
  },
}));
