import { authFetchAtom } from "@/src/store/auth-store"
import { chatStyles } from "@/src/styles/chat.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { useRef } from "react"
import { View, Text, TouchableOpacity, TextInput, Pressable } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import Toast from "react-native-toast-message"

type Reportable = "post" | "user"

export default function Report() {
  const { reportable, postId, userId } = useLocalSearchParams<{
    reportable: Reportable
    postId: string
    userId: string
  }>()
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const report = useRef("")

  async function submitReport() {
    let apiEndpoint = ""

    if (reportable === "post") {
      apiEndpoint = "/api/posts/report"
    } else if (reportable === "user") {
      apiEndpoint = "/api/users/report"
    }

    const res = await authFetch(apiEndpoint, {
      method: "PUT",
      body: JSON.stringify({ userId, postId, report: report.current }),
    })
    if (!res.ok) {
      Toast.show({
        type: "error",
        text1: "Error submitting report. Please try again later.",
      })
      return
    }
    Toast.show({
      type: "success",
      text1: "Report submitted! Thank you for helping us keep the community safe.",
    })
    router.back()
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors.light,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 25,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={chatStyles.modalTitle}>Report {reportable === "post" ? "Post" : "User"}</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 40,
            height: 40,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.lightGray,
            borderRadius: 20,
          }}
        >
          <Feather name="x" size={24} color={colors.darkGray} />
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder={`Tell us why you are reporting this ${reportable}...`}
        placeholderTextColor={colors.muted}
        style={{
          paddingTop: 10,
          minHeight: 200,
          width: "100%",
          marginTop: 30,
          paddingHorizontal: 10,
          textAlignVertical: "top",
          color: colors.dark,
          fontSize: 16,
          borderWidth: 1,
          borderColor: colors.gray,
          borderRadius: 5,
        }}
        onChangeText={text => (report.current = text)}
        multiline
        autoFocus
      />
      <Pressable
        onPress={submitReport}
        style={{
          marginTop: 20,
          paddingVertical: 10,
          paddingHorizontal: 30,
          backgroundColor: colors.purple,
          borderRadius: 5,
        }}
      >
        <Text style={{ color: colors.light, fontWeight: "bold" }}>Submit</Text>
      </Pressable>
    </SafeAreaView>
  )
}
