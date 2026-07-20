import { View, Text, Platform, Alert } from "react-native"
import React from "react"
import { commonStyles } from "../styles/common.styles"
import CustomButton from "../components/CustomButton"
import { colors } from "../utils/colors"
import Toast from "react-native-toast-message"
import { useSetAtom } from "jotai"
import { authFetchAtom } from "../store/auth-store"

export default function DeleteAccount() {
  const authFetch = useSetAtom(authFetchAtom)

  async function requestDelete() {
    try {
      const response = await authFetch("/api/auth/delete-account", {
        method: "DELETE",
      })

      if (response.ok) {
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Account deleted successfully. We're sorry to see you go.",
        })
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to delete account. Please try again later.",
        })
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to delete account. Please try again later.",
      })
    }
  }

  async function deleteAccount() {
    if (Platform.OS === "web") {
      if (
        window.confirm(
          "Are you absolutely sure you want to delete your account? This is irreversible!"
        )
      ) {
        await requestDelete()
      }
    }

    Alert.alert(
      "Confirm",
      "Are you absolutely sure you want to delete your account? This is irreversible!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: requestDelete,
        },
      ]
    )
  }

  return (
    <View style={commonStyles.generalContainer}>
      <View style={commonStyles.container}>
        <Text
          style={{
            color: colors.errorRed,
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 20,
          }}
        >
          Are you sure you want to delete your account? This action cannot be undone.
        </Text>
        <CustomButton onPress={deleteAccount} color={colors.errorRed}>
          Delete Account
        </CustomButton>
      </View>
    </View>
  )
}
