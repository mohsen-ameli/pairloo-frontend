import CustomButton from "@/src/components/CustomButton"
import { sendAttachmentAtom } from "@/src/store/chat-store"
import { chatStyles } from "@/src/styles/chat.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useSetAtom } from "jotai"
import { Text, TouchableOpacity, View } from "react-native"
import { setUserPfpAtom } from "@/src/store/settings-store"
import { setUserPictureAtom } from "@/src/store/auth-store"

export default function AttachmentPicker() {
  const router = useRouter()
  const { intent } = useLocalSearchParams<{ intent: "chat" | "pfp" | "signup" }>()
  const sendAttachment = useSetAtom(sendAttachmentAtom)
  const setPfp = useSetAtom(setUserPfpAtom)
  const setPicture = useSetAtom(setUserPictureAtom)

  return (
    <View style={chatStyles.modalContainer}>
      <TouchableOpacity onPress={() => router.back()} style={chatStyles.dismissButton}>
        <Feather name="x" size={24} color={colors.darkGray} />
      </TouchableOpacity>
      <Text style={chatStyles.modalTitle}>Choose Attachment</Text>
      <View style={chatStyles.attachmentContainer}>
        <CustomButton
          color={colors.blue}
          onPress={() => {
            if (intent === "chat") {
              sendAttachment("library")
            } else if (intent === "pfp") {
              setPfp("library")
            } else if (intent === "signup") {
              setPicture("library")
            }
            router.back()
          }}
        >
          <Feather name="image" size={20} style={{ marginRight: 10 }} /> Upload Media
        </CustomButton>
        <CustomButton
          color={colors.blue}
          onPress={() => {
            if (intent === "chat") {
              sendAttachment("camera")
            } else if (intent === "pfp") {
              setPfp("camera")
            } else if (intent === "signup") {
              setPicture("camera")
            }
            router.back()
          }}
        >
          <Feather name="camera" size={20} style={{ marginRight: 10 }} /> Open Camera
        </CustomButton>
      </View>
    </View>
  )
}
