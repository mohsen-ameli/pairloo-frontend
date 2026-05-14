import { StyleSheet } from "react-native"
import { colors } from "@/src/utils/colors"

export const editPostStyles = StyleSheet.create({
  scrollView: {
    padding: 15,
    borderColor: colors.borderGray,
  },
  gaptainer: {
    gap: 10,
  },
  lastPageRowContainer: {
    backgroundColor: colors.lightGray,
    padding: 15,
    borderRadius: 8,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastPageRowLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  lastPageQuestion: {
    color: colors.dark,
    fontSize: 18,
    fontWeight: "600",
  },
  uploadImageButton: {
    height: 250,
    backgroundColor: colors.lightGray,
    borderColor: colors.purple,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addMoreImagesButton: {
    backgroundColor: colors.lightGray,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    width: 200,
    marginVertical: 15,
    marginHorizontal: "auto",
    paddingVertical: 5,
    borderRadius: 25,
    gap: 8,
  },
  locationClearButton: {
    backgroundColor: colors.lightGray,
    padding: 5,
    borderRadius: 5,
    marginLeft: 10,
  },
})
