import CustomButton from "@/src/components/CustomButton"
import { currentConversationAtom, sendAttachmentAtom } from "@/src/store/chat-store"
import { chatStyles } from "@/src/styles/chat.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useRouter } from "expo-router"
import { useAtomValue, useSetAtom } from "jotai"
import { Text, TouchableOpacity, View } from "react-native"

export default function AttachmentPicker() {
  const router = useRouter()
  const conversationId = useAtomValue(currentConversationAtom)?._id
  const sendAttachment = useSetAtom(sendAttachmentAtom)

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
            sendAttachment(true, conversationId)
            router.back()
          }}
        >
          <Feather name="image" size={20} color={colors.light} style={{ marginRight: 10 }} /> Upload
          Media
        </CustomButton>
        <CustomButton
          color={colors.blue}
          onPress={() => {
            sendAttachment(false, conversationId)
            router.back()
          }}
        >
          <Feather name="camera" size={20} color={colors.light} style={{ marginRight: 10 }} /> Open
          Camera
        </CustomButton>
      </View>
    </View>
  )
}
