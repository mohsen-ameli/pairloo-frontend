import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export const errorStyles = StyleSheet.create({
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  retryButton: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: colors.accentOrange,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "600",
  },
});
