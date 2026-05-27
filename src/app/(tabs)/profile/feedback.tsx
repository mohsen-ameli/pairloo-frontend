import React, { useState } from "react"
import { View, ScrollView, Text, TouchableOpacity } from "react-native"
import CustomInput from "@/src/components/CustomInput"
import CustomButton from "@/src/components/CustomButton"
import { colors } from "@/src/utils/colors"
import Toast from "react-native-toast-message"
import { authFetchAtom } from "@/src/store/auth-store"
import { useSetAtom } from "jotai"
import { useRouter } from "expo-router"
import { styles } from "@/src/styles/feedback.styles"
import { SafeAreaView } from "react-native-safe-area-context"
import Feather from "@expo/vector-icons/Feather"

export default function Feedback() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [titleError, setTitleError] = useState("")
  const [descriptionError, setDescriptionError] = useState("")
  const [loading, setLoading] = useState(false)
  const authFetch = useSetAtom(authFetchAtom)

  async function submit() {
    let hasErrors = false

    if (!title.trim()) {
      setTitleError("Title is required")
      hasErrors = true
    } else {
      setTitleError("")
    }

    if (!description.trim()) {
      setDescriptionError("Description is required")
      hasErrors = true
    } else {
      setDescriptionError("")
    }

    if (hasErrors) return

    setLoading(true)
    try {
      const res = await authFetch("/api/users/feedback", {
        method: "POST",
        body: JSON.stringify({ title: title.trim(), description: description.trim() }),
      })

      if (!res.ok) {
        Toast.show({ type: "error", text1: "Failed to submit feedback" })
        setLoading(false)
        return
      }

      Toast.show({ type: "success", text1: "Feedback submitted. Thank you!" })
      router.back()
    } catch (e: any) {
      setTitleError("")
      setDescriptionError("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feedback</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Feather name="x" size={24} color={colors.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        style={styles.scrollView}
      >
        <View style={styles.form}>
          <CustomInput
            headerStyles={styles.sectionTitle}
            title="Title"
            value={title}
            onChangeText={text => {
              setTitle(text)
              if (titleError) setTitleError("")
            }}
            editable={!loading}
            mandatory
            errors={titleError}
          />

          <CustomInput
            headerStyles={styles.sectionTitle}
            title="Description"
            value={description}
            onChangeText={text => {
              setDescription(text)
              if (descriptionError) setDescriptionError("")
            }}
            editable={!loading}
            multiline
            numberOfLines={8}
            mandatory
            errors={descriptionError}
          />

          <Text style={styles.note}>Tell us how we can improve!</Text>

          <CustomButton
            onPress={submit}
            disabled={loading}
            color={loading ? colors.lightGray : colors.purple}
            fontSize={16}
            style={styles.submitButton}
          >
            {loading ? "Sending..." : "Send Feedback"}
          </CustomButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
