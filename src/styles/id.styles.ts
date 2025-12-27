import { StyleSheet } from "react-native";
import { colors } from "../utils/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.darkGray,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: colors.blue,
    marginBottom: 16,
  },
  productImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: colors.lightGray,
  },
  fieldLine: {
    fontSize: 16,
    color: colors.darkGray,
    marginBottom: 10,
    lineHeight: 22,
  },
  fieldLabel: {
    fontWeight: "bold",
    color: colors.darkGray,
    textTransform: "capitalize",
  },
  error: {
    color: colors.errorRed,
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    marginBottom: 18,
    alignSelf: "flex-start",
    backgroundColor: colors.lightGray,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  backButtonText: {
    color: colors.blue,
    fontSize: 16,
    fontWeight: "500",
  },
  contactButton: {
    marginTop: 24,
    backgroundColor: colors.blue,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  contactButtonText: {
    color: colors.light,
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  bottomBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.light,
    padding: 16,
  },
});

export default styles;
