import { Appearance } from "react-native"

const colorScheme = Appearance.getColorScheme()

const baseColors = {
  purple: "#6B46C1",
  lightPurple: "#9880f5",
  darkPurple: "#3a1d8bff",
  dark: "#1d1d25",
  light: "#ffffff",
  gray: "#8e8e93",
  darkGray: "#3a3a3a",
  lightGray: "#e6e6e6",
  textSecondary: "#3c3c4399",
  errorRed: "#ff3b30",
  green: "#059669",
  successGreen: "#34c759",
  lightGreen: "#E7F5ED",
  warningYellow: "#ffcc00",
  yellow: "#c76e00ff",
  borderGray: "#d1d1d6",
  lightTransparent: "#ffffff8e",
  darkTransparent: "#0000008e",
  blue: "#007AFF",
  lightBlue: "#5ac8ff",
  muted: "#999999",
  shadow: "#373535",
}

export const colors = { ...baseColors }

if (colorScheme === "dark") {
  colors.textSecondary = baseColors.lightGray
  colors.borderGray = baseColors.darkGray
  colors.shadow = baseColors.light
  colors.light = baseColors.dark
  colors.dark = baseColors.light
  colors.lightGray = "#3a3a3aff"
  colors.darkTransparent = baseColors.lightTransparent
  colors.lightTransparent = baseColors.darkTransparent
  colors.gray = baseColors.lightGray
  colors.darkGray = baseColors.lightGray
  colors.purple = baseColors.lightPurple
  colors.lightPurple = baseColors.purple
}
