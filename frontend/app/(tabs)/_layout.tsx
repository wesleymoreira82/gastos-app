import { Tabs, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { colors } from "@/src/theme";

export default function TabsLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            elevation: 0,
            paddingTop: 6,
          },
          tabBarItemStyle: { alignSelf: "center" },
          tabBarActiveTintColor: colors.onSurface,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Início",
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons name="home-variant" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="gastos"
          options={{
            title: "Gastos",
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons name="format-list-bulleted" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="graficos"
          options={{
            title: "Gráficos",
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons name="chart-bar" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="config"
          options={{
            title: "Config.",
            tabBarIcon: ({ color }) => (
              <MaterialDesignIcons name="cog-outline" size={22} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Floating + button, always accessible */}
      <Pressable
        onPress={() => router.push("/add-expense")}
        style={({ pressed }) => [
          styles.fab,
          { bottom: 60 + insets.bottom + 12, opacity: pressed ? 0.85 : 1 },
        ]}
        testID="fab-add-expense"
        accessibilityLabel="Adicionar gasto"
      >
        <MaterialDesignIcons name="plus" size={30} color={colors.onBrandPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
