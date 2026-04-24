import { View, TouchableOpacity, Text, Platform, Alert, Share } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { chatStyles } from "@/src/styles/chat.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import CustomButton from "@/src/components/CustomButton"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAtom, useSetAtom } from "jotai"
import { currentLongPressedMessageAtom, replyingToAtom } from "@/src/store/chat-store"
import Clipboard from "@react-native-clipboard/clipboard"

export default function MessageActionModal() {
  const router = useRouter()
  const [currentLongPressedMessage, setCurrentLongPressedMessage] = useAtom(
    currentLongPressedMessageAtom
  )
  const setReplyingTo = useSetAtom(replyingToAtom)
  const { isOwnMessage } = useLocalSearchParams<{
    isOwnMessage: string
  }>()

  const isOwnMsg = isOwnMessage === "true"

  const handleModalClose = () => {
    setCurrentLongPressedMessage(null)
    router.back()
  }

  const handleReply = () => {
    if (currentLongPressedMessage) {
      setReplyingTo(currentLongPressedMessage)
    }
    handleModalClose()
  }

  const handleCopy = async () => {
    if (!currentLongPressedMessage) return
    const content = currentLongPressedMessage.content || ""

    try {
      await Clipboard.setString(content)
      handleModalClose()
    } catch (error) {
      console.error("Copy error:", error)
    }
  }

  const handleShare = async () => {
    if (!currentLongPressedMessage) return

    try {
      const content = currentLongPressedMessage.content || ""
      await Share.share({
        message: content,
      })
      handleModalClose()
    } catch (error) {
      console.error("Share error:", error)
    }
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

        <CustomButton style={buttonStyle} onPress={handleCopy}>
          <Text style={{ color: colors.dark, fontSize: 16 }}>
            <Feather name="copy" size={18} /> Copy Message
          </Text>
        </CustomButton>

        <CustomButton style={buttonStyle} onPress={handleShare}>
          <Text style={{ color: colors.dark, fontSize: 16 }}>
            <Feather name="share" size={18} /> Share Message
          </Text>
        </CustomButton>

        {isOwnMsg ? (
          <>
            <CustomButton style={buttonStyle} onPress={handleModalClose}>
              <Text style={{ color: colors.dark, fontSize: 16 }}>
                <Feather name="edit-2" size={18} /> Edit Message
              </Text>
            </CustomButton>

            <CustomButton style={buttonStyle} onPress={handleModalClose}>
              <Text style={{ color: colors.dark, fontSize: 16 }}>
                <Feather name="trash-2" size={18} /> Delete Message
              </Text>
            </CustomButton>
          </>
        ) : (
          <CustomButton style={buttonStyle} onPress={handleModalClose}>
            <Text style={{ color: colors.dark, fontSize: 16 }}>
              <Feather name="flag" size={18} /> Report Message
            </Text>
          </CustomButton>
        )}
      </View>
    </SafeAreaView>
  )
}
