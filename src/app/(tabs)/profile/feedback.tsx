import React, { useState } from "react"
import { View, ScrollView } from "react-native"
import CustomInput from "@/src/components/CustomInput"
import CustomButton from "@/src/components/CustomButton"
import { commonStyles } from "@/src/styles/common.styles"
import { colors } from "@/src/utils/colors"
import Toast from "react-native-toast-message"
import { BASE_URL } from "@/src/utils/constants"
import { useRouter } from "expo-router"
import { styles, SIDE_OFFSET } from "@/src/styles/feedback.styles"

export default function Feedback() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!title.trim()) {
      Toast.show({ type: "error", text1: "Title is required" })
      return
    }
    if (!description.trim()) {
      Toast.show({ type: "error", text1: "Description is required" })
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })

      if (res.ok) {
        Toast.show({ type: "success", text1: "Feedback submitted. Thank you!" })
        router.back()
      } else {
        const data = await res.json().catch(() => null)
        const err = data?.error || data?.message || "Failed to submit feedback"
        Toast.show({ type: "error", text1: err })
      }
    } catch (e: any) {
      Toast.show({ type: "error", text1: e?.message || "Network error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[commonStyles.generalContainer, { flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={commonStyles.container}>
        <CustomInput
          headerStyles={styles.sectionTitle}
          title="Title"
          value={title}
          onChangeText={setTitle}
          editable={!loading}
          mandatory
        />

        <CustomInput
          headerStyles={styles.sectionTitle}
          title="Description"
          value={description}
          onChangeText={setDescription}
          editable={!loading}
          multiline
          numberOfLines={8}
          mandatory
        />

        <CustomButton
          onPress={submit}
          disabled={loading}
          color={loading ? colors.lightGray : colors.purple}
          fontSize={16}
          style={{ marginTop: 20 }}
        >
          {loading ? "Sending..." : "Send Feedback"}
        </CustomButton>
      </View>
    </ScrollView>
  )
}
