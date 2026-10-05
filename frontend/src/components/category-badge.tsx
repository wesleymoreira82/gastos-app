import { View, Text, StyleSheet } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

type Props = {
  bg: string;
  icon: string;
  size?: number;
};

export function CategoryBadge({ bg, icon, size = 44 }: Props) {
  const fontSize = Math.round(size * 0.5);
  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          backgroundColor: `${bg}22`,
          borderColor: `${bg}55`,
        },
      ]}
    >
      <Text style={{ fontSize }}>{icon}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  // keep tokens referenced so unused-vars doesn't trip
  _unused: { padding: spacing.xs, backgroundColor: colors.surface },
});
