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
  const [loading, setLoading] = useState(false)
  const authFetch = useSetAtom(authFetchAtom)

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
      Toast.show({ type: "error", text1: e?.message || "Network error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.light,
        paddingTop: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
      }}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={styles.headerTitle}>Feedback</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            padding: 4,
            backgroundColor: colors.lightGray,
            borderRadius: 20,
          }}
        >
          <Feather name="x" size={24} color={colors.darkGray} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        style={{ width: "100%", marginTop: 20 }}
      >
        <View>
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

          <Text style={styles.note}>Tell us how we can improve!</Text>

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
    </SafeAreaView>
  )
}
