import { derived, writable } from "svelte/store";
import type { Readable } from "svelte/store";

export const availableThemes = [
  {
    name: "Night Wind",
    className: "night-wind",
    color: {
      accent: "#795ffa",
      "accent-semi": "#7c62fe",
      "accent-check": "#8871f9",
      bg: "#101012",
      "bg-raised": "#131416",

      interact: "#1c1c20",
      "interact-border": "#202026",
      "text-main": "rgba(255, 255, 255, 0.87)",
      "text-second": "#c4c4c4",
      "text-disabled": "rgba(255, 255, 255, 0.4)",

      "grid-bg": "#181a1c",
      "grid-line": "#202024",
    },
  },
  {
    name: "Cold Breeze",
    className: "cold-breeze",
    color: {
      accent: "#0082c9",
      "accent-semi": "#4da1f6",
      "accent-check": "#0066ac",
      bg: "#f5f5f5",
      "bg-raised": "#ffffff",

      interact: "#e2e2e2",
      "interact-border": "#d6d6d6",
      "text-main": "#333333",
      "text-second": "#666666",
      "text-disabled": "rgba(0, 0, 0, 0.4)",

      "grid-bg": "#eaeaea",
      "grid-line": "#d4d4d4",
    },
  },
];

export const appThemeName = writable(availableThemes[0].name);
export const appThemeClass = derived(appThemeName, ($appThemeName) => {
  const selectedTheme = availableThemes.find(
    (theme) => theme.name === $appThemeName
  );
  return selectedTheme ? selectedTheme.className : "night-wind";
});

export const appThemeColors: Readable<Record<string, string>> = derived(
  appThemeName,
  ($appThemeName) => {
    const selectedTheme = availableThemes.find(
      (theme) => theme.name === $appThemeName
    );
    return selectedTheme ? selectedTheme.color : {};
  }
);
