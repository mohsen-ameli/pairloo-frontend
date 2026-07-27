import { StyleSheet } from "react-native"
import { colors } from "../utils/colors"

export const policyStyles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.dark,
  },
  lastUpdated: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 24,
    color: colors.gray,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: colors.dark,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 20,
    color: colors.dark,
  },
  subheading: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 10,
    marginTop: 12,
    color: colors.dark,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.darkGray,
    marginBottom: 12,
  },
  bold: {
    fontWeight: "600",
    color: colors.dark,
  },
  bulletContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  bulletDot: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
    color: colors.gray,
  },
  link: {
    color: colors.purple,
    textDecorationLine: "underline",
  },
  section: {
    marginTop: 8,
  },
  subsection: {
    marginTop: 12,
    marginBottom: 12,
  },
})
