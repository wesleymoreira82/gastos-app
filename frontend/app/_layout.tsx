import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { LogBox } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { queryClient } from "@/src/query-client";
import { FinanceProvider } from "@/src/store/finance";
import { colors } from "@/src/theme";

// Disable logbox errors etc so that users can see the app
// and agent works as expected.
LogBox.ignoreAllLogs(true);

// Suppress noisy react-dom property warnings on web preview.
if (typeof window !== "undefined") {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    const first = typeof args[0] === "string" ? args[0] : "";
    if (
      first.includes("Invalid DOM property") ||
      first.includes("transform-origin") ||
      first.includes("Unknown event handler property")
    ) {
      return;
    }
    origError(...(args as []));
  };
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.surface }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <KeyboardProvider>
              <FinanceProvider>
                <StatusBar style="light" backgroundColor={colors.surface} />
                <Stack
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: colors.surface },
                    animation: "slide_from_right",
                  }}
                >
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="add-expense"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      contentStyle: { backgroundColor: colors.surface },
                    }}
                  />
                  <Stack.Screen
                    name="edit-expense/[id]"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      contentStyle: { backgroundColor: colors.surface },
                    }}
                  />
                  <Stack.Screen
                    name="fixos-new"
                    options={{
                      presentation: "modal",
                      animation: "slide_from_bottom",
                      contentStyle: { backgroundColor: colors.surface },
                    }}
                  />
                </Stack>
              </FinanceProvider>
            </KeyboardProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
