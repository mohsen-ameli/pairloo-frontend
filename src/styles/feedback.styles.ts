import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const SIDE_OFFSET = 12
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  header: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  scrollView: {
    width: "100%",
    marginTop: 20,
  },
  form: {
    width: "100%",
  },
  submitButton: {
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.dark,
  },
  note: {
    marginTop: 8,
    color: colors.darkGray,
    fontStyle: "italic",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 8,
    marginTop: 8,
  },
})
