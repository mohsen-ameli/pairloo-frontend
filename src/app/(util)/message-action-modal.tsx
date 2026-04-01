import { View, TouchableOpacity, Text, Platform } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { chatStyles } from "@/src/styles/chat.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import CustomButton from "@/src/components/CustomButton"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAtomValue, useSetAtom } from "jotai"
import { userJwtAtom } from "@/src/store/auth-store"
import { messagesAtom, replyingToAtom } from "@/src/store/chat-store"

export default function MessageActionModal() {
  const router = useRouter()
  const userJwt = useAtomValue(userJwtAtom)
  const messages = useAtomValue(messagesAtom)
  const setReplyingTo = useSetAtom(replyingToAtom)
  const { messageId, senderId } = useLocalSearchParams<{ messageId: string; senderId: string }>()

  const isOwnMessage = userJwt?._id === senderId

  const handleModalClose = () => {
    router.back()
  }

  const handleReply = () => {
    const messageToReply = messages.find(msg => msg._id === messageId)
    if (messageToReply) {
      setReplyingTo(messageToReply)
    }
    handleModalClose()
  }

  const buttonStyle = {
    alignItems: "flex-start" as const,
    paddingLeft: 10,
    backgroundColor: colors.light,
    shadowRadius: 0,
    elevation: 0,
    shadowOpacity: 0,
  }

  return (
    <SafeAreaView>
      <TouchableOpacity
        onPress={handleModalClose}
        style={[chatStyles.dismissButton, { zIndex: 10 }]}
      >
        <Feather name="x" size={24} color={colors.darkGray} />
      </TouchableOpacity>

      <View
        style={{
          width: 40,
          height: 4,
          backgroundColor: colors.gray,
          borderRadius: 2,
          alignSelf: "center",
          marginTop: Platform.OS === "android" ? 0 : 10,
        }}
      />

      <View style={{ paddingHorizontal: 15, marginBottom: Platform.OS === "android" ? 60 : 0 }}>
        <CustomButton style={buttonStyle} onPress={handleReply}>
          <Text style={{ color: colors.dark, fontSize: 16 }}>
            <MaterialIcons name="reply" size={18} /> Reply
          </Text>
        </CustomButton>

        <CustomButton
          style={buttonStyle}
          onPress={() => {
            // Placeholder: Copy message functionality
            console.log("Copy message:", messageId)
            handleModalClose()
          }}
        >
          <Text style={{ color: colors.dark, fontSize: 16 }}>
            <Feather name="copy" size={18} /> Copy Message
          </Text>
        </CustomButton>

        <CustomButton
          style={buttonStyle}
          onPress={() => {
            // Placeholder: Share message functionality
            console.log("Share message:", messageId)
            handleModalClose()
          }}
        >
          <Text style={{ color: colors.dark, fontSize: 16 }}>
            <Feather name="share" size={18} /> Share Message
          </Text>
        </CustomButton>

        {isOwnMessage ? (
          <>
            <CustomButton
              style={buttonStyle}
              onPress={() => {
                // Placeholder: Edit message functionality
                console.log("Edit message:", messageId)
                handleModalClose()
              }}
            >
              <Text style={{ color: colors.dark, fontSize: 16 }}>
                <Feather name="edit-2" size={18} /> Edit Message
              </Text>
            </CustomButton>

            <CustomButton
              style={buttonStyle}
              onPress={() => {
                // Placeholder: Delete message functionality
                console.log("Delete message:", messageId)
                handleModalClose()
              }}
            >
              <Text style={{ color: colors.dark, fontSize: 16 }}>
                <Feather name="trash-2" size={18} /> Delete Message
              </Text>
            </CustomButton>
          </>
        ) : (
          <CustomButton
            style={buttonStyle}
            onPress={() => {
              // Placeholder: Report message functionality
              console.log("Report message:", messageId)
              handleModalClose()
            }}
          >
            <Text style={{ color: colors.dark, fontSize: 16 }}>
              <Feather name="flag" size={18} /> Report Message
            </Text>
          </CustomButton>
        )}
      </View>
    </SafeAreaView>
  )
}
