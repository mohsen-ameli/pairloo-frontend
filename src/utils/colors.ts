import { Appearance, Dimensions, Platform } from "react-native"

const colorScheme = Appearance.getColorScheme()

export const isDesktop = Dimensions.get("window").width > 700
export const isWeb = Platform.OS === "web" && isDesktop
export const webContainerWidth = 600

export const baseColors = {
  purple: "#6B46C1",
  lightPurple: "#9880f5",
  darkPurple: "#3a1d8bff",
  dark: "#1d1d25",
  light: "#fcfbff",
  gray: "#8e8e93",
  darkGray: "#525252",
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
  transparent: "transparent",
  chatHighlightOwnBubble: "#b192f4",
  chatHighlightOtherBubble: "#c4b0ed",
  blue: "#007AFF",
  lightBlue: "#5ac8ff",
  muted: "#999999",
  shadow: "#373535",
  shadowA: "rgba(0, 0, 0, 0.16)",
  shadowB: "rgba(0, 0, 0, 0.23)",
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
  colors.chatHighlightOwnBubble = "#d8cbf4"
  colors.chatHighlightOtherBubble = "#6d4ab8"
  colors.gray = baseColors.lightGray
  colors.darkGray = baseColors.lightGray
  colors.purple = baseColors.lightPurple
  colors.darkPurple = baseColors.lightPurple
  colors.lightPurple = baseColors.purple
  colors.shadowA = "rgba(0, 0, 0, 0.36)"
  colors.shadowB = "rgba(0, 0, 0, 0.43)"
}

// https://getcssscan.com/css-box-shadow-examples
// we're using #28
// rgba(0, 0, 0, 0.16) 0px 3px 6px, rgba(0, 0, 0, 0.23) 0px 3px 6px
export const boxShadow = `${colors.shadowA} 0px 3px 6px, ${colors.shadowB} 0px 3px 6px`
