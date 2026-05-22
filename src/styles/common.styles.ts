import { Dimensions, Platform, StyleSheet } from "react-native"
import { boxShadow, colors } from "@/src/utils/colors"

const windowWidth = Dimensions.get("screen").width
const isWeb = Platform.OS === "web" && Dimensions.get("window").width > 700

export const commonStyles = StyleSheet.create({
  // Containers
  generalContainer: {
    flex: 1,
    backgroundColor: colors.light,
    paddingHorizontal: 5,
  },
  container: {
    backgroundColor: colors.light,
    padding: 10,
    width: isWeb && windowWidth > 600 ? 600 : "100%",
    alignSelf: "center",
  },

  // Cards
  card: {
    backgroundColor: colors.light,
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    boxShadow,
  },
  cardImageContainer: {
    width: "100%",
    height: isWeb ? 450 : 250,
    borderRadius: 8,
  },
  cardImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },

  // Buttons
  floatingButton: {
    width: isWeb ? "40%" : "100%",
    alignSelf: "center",
    paddingHorizontal: 16,
    padding: 16,
  },
  dismissButton: { paddingVertical: 10, paddingLeft: 20, paddingRight: 10 },

  // Search Modal
  searchContainer: {
    paddingVertical: 15,
    paddingRight: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.borderGray,
    padding: 10,
    borderRadius: 5,
    color: colors.dark,
    fontSize: 16,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.light,
  },

  // Error styles
  errorText: {
    color: colors.dark,
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  retryButton: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: colors.lightGray,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.dark,
    fontSize: 16,
    fontWeight: "600",
  },
})
