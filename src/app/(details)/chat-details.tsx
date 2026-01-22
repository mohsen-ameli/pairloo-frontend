import { View, Text, Pressable, TextInput, Alert, Modal, TouchableOpacity } from "react-native"
import { memo, useEffect, useRef, useState } from "react"
import { useLocalSearchParams } from "expo-router/build/hooks"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Image } from "expo-image"
import {
  conversationsAtom,
  currentConversationAtom,
  messagesAtom,
  sendAttachmentAtom,
  sendMessageAtom,
} from "@/src/store/chat-store"
import { colors } from "@/src/utils/colors"
import { ConversationType, MessageType, OtherUser } from "@/src/types/chat.type"
import Feather from "@expo/vector-icons/Feather"
import { formatDate } from "@/src/utils/format-date"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import useGradualAnimation from "@/src/utils/gradual-animation"
import { userAtom } from "@/src/store/auth-store"
import { chatStyles } from "@/src/styles/chat.styles"
import { chatSocketAtom } from "@/src/store/socket-store"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack, useFocusEffect } from "expo-router"
import { FlashList, FlashListRef } from "@shopify/flash-list"
import { SafeAreaView } from "react-native-safe-area-context"
import CustomButton from "@/src/components/CustomButton"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function ChatDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const socket = useAtomValue(chatSocketAtom)
  const [message, setMessage] = useState<string>("")
  const messages = useAtomValue(messagesAtom)
  const sendMessage = useSetAtom(sendMessageAtom)
  const user = useAtomValue(userAtom)
  const conversations = useAtomValue(conversationsAtom)
  const [conversation, setConversation] = useAtom(currentConversationAtom)
  const chatRef = useRef<FlashListRef<MessageType>>(null!)
  const { height } = useGradualAnimation({ includeTabHeight: false })
  const [otherUser, setOtherUser] = useState<OtherUser>(null!)
  const [showModal, setShowModal] = useState<boolean>(false)
  const detailOptions = useCustomHeader("", otherUser)
  const sendAttachment = useSetAtom(sendAttachmentAtom)

  useEffect(() => {
    if (!conversations || !user || !socket) return

    // Find the current conversation
    const conv = conversations.find(conv => conv._id === id)
    if (!conv) return

    setConversation(conv)
    setOtherUser(conv.members.find(member => member._id !== user._id)!)
    socket.emit("getMessages", id)
  }, [conversations, user, socket, id])

  useFocusEffect(() => {
    return () => {
      setConversation(null)
    }
  })

  async function handleSendMessage() {
    const msg = message.trim()
    if (!msg) return
    setMessage("")
    await sendMessage(id, msg)
  }

  // Animate fake view height
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value) - 15,
    }
  }, [])

  if (!conversation || !otherUser || !messages) {
    return (
      <View style={chatStyles.notFoundContainer}>
        <Text>Conversation not found</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen options={detailOptions} />

      <View style={chatStyles.container}>
        <FlashList
          data={messages}
          ref={chatRef}
          onContentSizeChange={() => chatRef.current.scrollToEnd({ animated: false })}
          keyboardDismissMode="on-drag"
          onLayout={() => chatRef.current.scrollToEnd({ animated: false })}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <MemoizedMessageItem item={item} />}
        />
      </View>

      {/* Input Area */}
      <View style={chatStyles.inputContainer}>
        <Pressable onPress={() => setShowModal(true)} style={chatStyles.plusButton}>
          <Feather name="plus" size={26} color={colors.dark} />
        </Pressable>
        <TextInput
          style={chatStyles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          value={message}
          onChangeText={text => setMessage(text)}
        />
        <Pressable
          style={[chatStyles.sendButton, { display: message.trim() ? "flex" : "none" }]}
          onPress={handleSendMessage}
        >
          <Feather name="send" size={22} color={colors.lightGray} />
        </Pressable>
      </View>

      <Animated.View style={[fakeView, { backgroundColor: colors.lightGray }]} />

      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={chatStyles.modalContainer}>
          <TouchableOpacity
            onPress={() => {
              setShowModal(false)
            }}
            style={chatStyles.dismissButton}
          >
            <Feather name="x" size={20} color={colors.dark} />
          </TouchableOpacity>
          <View style={chatStyles.attachmentContainer}>
            <CustomButton
              color={colors.blue}
              onPress={() => {
                sendAttachment(true, id)
                setShowModal(false)
              }}
            >
              <Feather name="image" size={20} color={colors.light} style={{ marginRight: 10 }} />{" "}
              Upload Media
            </CustomButton>
            <CustomButton
              color={colors.blue}
              onPress={() => {
                sendAttachment(false, id)
                setShowModal(false)
              }}
            >
              <Feather name="camera" size={20} color={colors.light} style={{ marginRight: 10 }} />{" "}
              Open Camera
            </CustomButton>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  )
}

function MessageItem({ item }: { item: MessageType }) {
  return (
    <View style={chatStyles.messageItem}>
      <Image
        source={item.sender.picture ? { uri: item.sender.picture } : defaultProfilePicture}
        style={chatStyles.messageImage}
      />
      <View>
        <View style={chatStyles.messageHeader}>
          <Text style={chatStyles.messageUsername}>{item.sender.username}</Text>
          <Text style={chatStyles.messageDate}>{formatDate(item.createdAt)}</Text>
        </View>
        {item.content && (
          <Text
            style={[
              chatStyles.messageContent,
              {
                color: item.optimistic ? colors.gray : colors.dark,
              },
            ]}
          >
            {item.content}
          </Text>
        )}
        {item.attachmentUrl && (
          <Image
            source={{ uri: item.attachmentUrl }}
            style={chatStyles.messageAttachment}
            contentFit="contain"
          />
        )}
      </View>
    </View>
  )
}

const MemoizedMessageItem = memo(MessageItem)
