// JOLO design tokens — Aroma & Crema palette.
// Sourced from the design system DESIGN.md files.

export const Palette = {
  background: "#fcf9f8",
  surface: "#fcf9f8",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainer: "#f0eded",
  surfaceContainerHigh: "#eae7e7",
  surfaceContainerHighest: "#e5e2e1",
  surfaceVariant: "#e5e2e1",

  onSurface: "#1c1b1b",
  onSurfaceVariant: "#4f4442",
  onBackground: "#1c1b1b",

  outline: "#817471",
  outlineVariant: "#d3c3c0",

  // Espresso — primary brand brown used in login/header
  primary: "#2c1b17",
  onPrimary: "#ffffff",
  primaryContainer: "#2e1a15",
  onPrimaryContainer: "#9f8079",

  // Caramel/Latte — accents, active tabs, CTAs
  secondary: "#7a582f",
  onSecondary: "#ffffff",
  secondaryContainer: "#fecf9c",
  onSecondaryContainer: "#79572e",

  tertiary: "#090704",
  onTertiary: "#ffffff",
  tertiaryContainer: "#221f1a",

  error: "#ba1a1a",
  onError: "#ffffff",
  errorContainer: "#ffdad6",

  // Watermark / pressed-text shade behind the JOLO logo
  watermark: "#d1cbc9",
};

// Kept for compatibility with existing themed components.
export const Colors = {
  light: {
    text: Palette.onSurface,
    background: Palette.background,
    tint: Palette.primary,
    tabIconDefault: Palette.onSurfaceVariant,
    tabIconSelected: Palette.primary,
  },
  dark: {
    text: Palette.onSurface,
    background: Palette.background,
    tint: Palette.primary,
    tabIconDefault: Palette.onSurfaceVariant,
    tabIconSelected: Palette.primary,
  },
};
