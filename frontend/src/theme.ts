// Design tokens for Controle Financeiro. Dark-first (always dark).
// Values come from /app/design_guidelines.json. Keep every key; never add a
// second theme or colors file; never write color literals in components.

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const dark = {
  // Surfaces
  surface: "#09090B",
  onSurface: "#FAFAFA",
  surfaceSecondary: "#18181B",
  onSurfaceSecondary: "#F4F4F5",
  surfaceTertiary: "#27272A",
  onSurfaceTertiary: "#E4E4E7",
  surfaceInverse: "#FAFAFA",
  onSurfaceInverse: "#09090B",
  muted: "#A1A1AA",

  // Brand — monochrome white for CTAs/FAB
  brand: "#FFFFFF",
  onBrand: "#000000",
  brandPrimary: "#FFFFFF",
  onBrandPrimary: "#09090B",
  brandSecondary: "#27272A",
  onBrandSecondary: "#FAFAFA",
  brandTertiary: "#3F3F46",
  onBrandTertiary: "#FAFAFA",

  // Status (semantic)
  success: "#22C55E",
  onSuccess: "#000000",
  warning: "#F59E0B",
  onWarning: "#000000",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#FAFAFA",
  onInfo: "#09090B",

  // Lines
  border: "#27272A",
  borderStrong: "#3F3F46",
  divider: "#27272A",
};

export type ThemeColors = typeof dark;

export const defaultScheme = "dark" satisfies ColorScheme;

// Only ship dark; the system scheme is overridden to dark on launch.
export const themes: { light?: ThemeColors; dark: ThemeColors } = { dark };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

// Force dark on native. react-native-web may not implement setColorScheme.
setColorScheme?.(defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  // Even if system reports light, we only ship dark.
  const _system = useColorScheme();
  return { scheme: "dark", colors: themes.dark };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export const colors = themes.dark;
