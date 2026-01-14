import { Appearance } from "react-native";

const colorScheme = Appearance.getColorScheme();

const baseColors = {
  purple: "#6B46C1",
  lightPurple: "rgb(167, 145, 255)",
  darkPurple: "#3a1d8bff",
  background: "#f2f2f7ff",
  lightBackground: "#ffffffcc",
  darkBackground: "#c7c7ccff",
  dark: "#000000ff",
  light: "#ffffffff",
  gray: "#8e8e93ff",
  darkGray: "#222222",
  lightGray: "#eeeeee",
  textSecondary: "#3c3c4399",
  errorRed: "#ff3b30ff",
  green: "#059669",
  successGreen: "#34c759ff",
  lightGreen: "#E7F5ED",
  warningYellow: "#ffcc00ff",
  yellow: "#e4b90cff",
  borderGray: "#d1d1d6ff",
  blue: "#007AFF",
  lightBlue: "#F0E7FF",
  accentOrange: "#f0f0f0",
  muted: "#999999",
  shadow: "#000000",
};

export const colors = { ...baseColors };

if (colorScheme === "dark") {
  colors.background = baseColors.darkBackground;
  colors.textSecondary = baseColors.lightGray;
  colors.borderGray = baseColors.darkGray;
  colors.shadow = baseColors.light;
  colors.light = baseColors.dark;
  colors.dark = baseColors.light;
  colors.lightBackground = baseColors.dark;
  colors.lightGray = baseColors.darkGray;
  colors.gray = baseColors.lightGray;
  colors.darkGray = baseColors.lightGray;
  colors.purple = baseColors.lightPurple;
}
