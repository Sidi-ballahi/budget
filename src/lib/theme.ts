// Color tokens copied verbatim from the Claude Design prototype
// (project/Depenses App.dc.html) for pixel-fidelity.
const darkPalette = {
  bg: "oklch(0.12 0.01 60)",
  card: "oklch(0.23 0.014 60)",
  cardBorder: "oklch(1 0 0 / 0.06)",
  sheetBg: "oklch(0.16 0.012 60)",
  textPrimary: "oklch(0.95 0.01 70)",
  textSecondary: "oklch(0.85 0.01 70)",
  textMuted: "oklch(0.68 0.02 70)",
  textFaint: "oklch(0.5 0.02 70)",
  accentGold: "oklch(0.78 0.13 80)",
  accentGreen: "oklch(0.72 0.14 150)",
  accentBlue: "oklch(0.72 0.14 230)",
  accentPurple: "oklch(0.72 0.14 300)",
  accentAmber: "oklch(0.72 0.14 80)",
  accentRed: "oklch(0.68 0.15 25)",
  neutralIcon: "oklch(0.15 0.02 60)",
  white6: "oklch(1 0 0 / 0.06)",
  white5: "oklch(1 0 0 / 0.05)",
  white4: "oklch(1 0 0 / 0.04)",
  white8: "oklch(1 0 0 / 0.08)",
  white15: "oklch(1 0 0 / 0.15)",
};

// Same tokens, recalibrated for a light "Liquid Glass" surface: dark text,
// and the subtle white overlays (white4..white15 - dividers, faint fills)
// flipped to black-based overlays since white-on-white would vanish.
const lightPalette: typeof darkPalette = {
  bg: "oklch(0.96 0.01 60)",
  card: "oklch(0.99 0.005 60)",
  cardBorder: "oklch(0 0 0 / 0.08)",
  sheetBg: "oklch(0.98 0.006 60)",
  textPrimary: "oklch(0.2 0.02 60)",
  textSecondary: "oklch(0.32 0.02 60)",
  textMuted: "oklch(0.46 0.02 60)",
  textFaint: "oklch(0.58 0.02 60)",
  accentGold: "oklch(0.72 0.14 80)",
  accentGreen: "oklch(0.62 0.15 150)",
  accentBlue: "oklch(0.62 0.15 230)",
  accentPurple: "oklch(0.62 0.15 300)",
  accentAmber: "oklch(0.62 0.15 80)",
  accentRed: "oklch(0.58 0.17 25)",
  neutralIcon: "oklch(0.15 0.02 60)",
  white6: "oklch(0 0 0 / 0.06)",
  white5: "oklch(0 0 0 / 0.05)",
  white4: "oklch(0 0 0 / 0.04)",
  white8: "oklch(0 0 0 / 0.08)",
  white15: "oklch(0 0 0 / 0.15)",
};

export type ThemeMode = "dark" | "light";

// Mutated in place (never reassigned) so every module that imported `colors`
// keeps seeing live values after a theme switch, without re-importing.
export const colors: typeof darkPalette = { ...darkPalette };

const THEME_KEY = "depenses:theme";
export const THEME_CHANGE_EVENT = "depenses:themechange";

export function getStoredThemeMode(): ThemeMode {
  if (typeof localStorage === "undefined") return "dark";
  return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
}

export function applyTheme(mode: ThemeMode): void {
  Object.assign(colors, mode === "light" ? lightPalette : darkPalette);
  if (typeof document !== "undefined") document.documentElement.dataset.theme = mode;
  if (typeof localStorage !== "undefined") localStorage.setItem(THEME_KEY, mode);
  if (typeof window !== "undefined") window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

export const fontFamily = "'Manrope', sans-serif";

// Preset swatches offered when creating an account or category.
export const COLOR_SWATCHES = [
  "oklch(0.72 0.14 230)",
  "oklch(0.72 0.14 300)",
  "oklch(0.72 0.14 80)",
  "oklch(0.72 0.14 150)",
  "oklch(0.68 0.15 25)",
  "oklch(0.78 0.13 80)",
  "oklch(0.7 0.14 190)",
  "oklch(0.7 0.16 340)",
];

// --- iOS 26 "Liquid Glass" helpers -----------------------------------
// Panels use `.glass` / `.glass-sheet` / `.glass-bar` (see globals.css)
// for the frosted blur + specular highlight. These helpers generate a
// swatch-tinted fill/border/glow so glass surfaces pick up each item's
// own color instead of sitting flat and neutral.
function parseOklch(input: string): { l: number; c: number; h: number } | null {
  const m = input.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) return null;
  return { l: parseFloat(m[1]), c: parseFloat(m[2]), h: parseFloat(m[3]) };
}

export function glassTint(swatch: string, opacity = 0.34): string {
  const p = parseOklch(swatch);
  if (!p) return swatch;
  return `linear-gradient(155deg, oklch(${p.l} ${p.c} ${p.h} / ${opacity}), oklch(${p.l} ${p.c} ${p.h} / ${opacity * 0.28}) 60%, oklch(1 0 0 / 0.05) 100%)`;
}

export function glassBorder(swatch: string, opacity = 0.45): string {
  const p = parseOklch(swatch);
  if (!p) return swatch;
  return `oklch(${p.l} ${p.c} ${p.h} / ${opacity})`;
}

export function glow(swatch: string, opacity = 0.4): string {
  const p = parseOklch(swatch);
  if (!p) return "none";
  return `0 8px 22px oklch(${p.l} ${p.c} ${p.h} / ${opacity})`;
}
