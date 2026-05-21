import { View, TouchableOpacity, Text, Platform, Alert, Share } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { chatStyles } from "@/src/styles/chat.styles"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import CustomButton from "@/src/components/CustomButton"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAtom, useSetAtom } from "jotai"
import {
  currentLongPressedMessageAtom,
  replyingToAtom,
  editingMessageAtom,
  deleteMessageAtom,
} from "@/src/store/chat-store"
import Clipboard from "@react-native-clipboard/clipboard"

export default function MessageActionModal() {
  const router = useRouter()
  const [currentLongPressedMessage, setCurrentLongPressedMessage] = useAtom(
    currentLongPressedMessageAtom
  )
  const setReplyingTo = useSetAtom(replyingToAtom)
  const setEditingMessage = useSetAtom(editingMessageAtom)
  const deleteMessage = useSetAtom(deleteMessageAtom)
  const { isOwnMessage } = useLocalSearchParams<{
    isOwnMessage: string
  }>()

  const isOwnMsg = isOwnMessage === "true"

  function handleModalClose() {
    setCurrentLongPressedMessage(null)
    router.back()
  }

  function handleReply() {
    if (currentLongPressedMessage) {
      setReplyingTo(currentLongPressedMessage)
    }
    handleModalClose()
  }

  async function handleCopy() {
    if (!currentLongPressedMessage) return
    const content = currentLongPressedMessage.content || ""

    try {
      Clipboard.setString(content)
      handleModalClose()
    } catch (error) {
      console.error("Copy error:", error)
    }
  }

  async function handleShare() {
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

  function handleEditPress() {
    if (currentLongPressedMessage) {
      setEditingMessage(currentLongPressedMessage)
    }
    handleModalClose()
  }

  function handleDeletePress() {
    if (!currentLongPressedMessage) return

    Alert.alert("Delete Message", "Are you sure you want to delete this message?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Delete",
        onPress: async () => {
          try {
            await deleteMessage(
              currentLongPressedMessage._id,
              currentLongPressedMessage.conversationId
            )
            handleModalClose()
          } catch (error) {
            console.error("Delete error:", error)
            Alert.alert("Error", "Failed to delete message")
          }
        },
        style: "destructive",
      },
    ])
  }

  const buttonStyle = {
    alignItems: "flex-start" as const,
    paddingLeft: 10,
    elevation: 0,
  }

  return (
    <SafeAreaView
      style={{
        flex: Platform.OS === "web" ? 1 : undefined,
        backgroundColor: colors.light,
      }}
    >
      <TouchableOpacity onPress={handleModalClose} style={chatStyles.dismissButton}>
        <Feather name="x" size={24} color={colors.darkGray} />
      </TouchableOpacity>

      <View
        style={{
          width: 40,
          height: 4,
          backgroundColor: colors.lightGray,
          borderRadius: 2,
          alignSelf: "center",
          marginTop: Platform.OS === "android" ? 0 : 10,
          marginBottom: 40,
        }}
      />

      <View style={{ paddingHorizontal: 15, marginBottom: Platform.OS === "android" ? 60 : 0 }}>
        <CustomButton color={colors.light} style={buttonStyle} onPress={handleReply}>
          <Text style={{ color: colors.dark, fontSize: 16 }}>
            <MaterialIcons name="reply" size={18} /> Reply
          </Text>
        </CustomButton>

        {currentLongPressedMessage?.content && (
          <CustomButton color={colors.light} style={buttonStyle} onPress={handleCopy}>
            <Text style={{ color: colors.dark, fontSize: 16 }}>
              <Feather name="copy" size={18} /> Copy Message
            </Text>
          </CustomButton>
        )}

        <CustomButton color={colors.light} style={buttonStyle} onPress={handleShare}>
          <Text style={{ color: colors.dark, fontSize: 16 }}>
            <Feather name="share" size={18} /> Share Message
          </Text>
        </CustomButton>

        {isOwnMsg ? (
          <>
            <CustomButton color={colors.light} style={buttonStyle} onPress={handleEditPress}>
              <Text style={{ color: colors.dark, fontSize: 16 }}>
                <Feather name="edit-2" size={18} /> Edit Message
              </Text>
            </CustomButton>

            <CustomButton color={colors.light} style={buttonStyle} onPress={handleDeletePress}>
              <Text style={{ color: colors.dark, fontSize: 16 }}>
                <Feather name="trash-2" size={18} /> Delete Message
              </Text>
            </CustomButton>
          </>
        ) : (
          <CustomButton color={colors.light} style={buttonStyle} onPress={handleModalClose}>
            <Text style={{ color: colors.dark, fontSize: 16 }}>
              <Feather name="flag" size={18} /> Report Message
            </Text>
          </CustomButton>
        )}
      </View>
    </SafeAreaView>
  )
}
