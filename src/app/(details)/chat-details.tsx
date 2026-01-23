import { View, Text, Pressable, TextInput } from "react-native"
import { memo, useEffect, useRef, useState } from "react"
import { useLocalSearchParams } from "expo-router/build/hooks"
import { useAtomValue, useSetAtom } from "jotai"
import { Image } from "expo-image"
import { conversationsAtom, messagesAtom, sendMessageAtom } from "@/src/store/chat-store"
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
import { Stack } from "expo-router"
import { FlashList, FlashListRef } from "@shopify/flash-list"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function ChatDetails() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const socket = useAtomValue(chatSocketAtom)
  const [message, setMessage] = useState<string>("")
  const messages = useAtomValue(messagesAtom)
  const sendMessage = useSetAtom(sendMessageAtom)
  const user = useAtomValue(userAtom)
  const conversations = useAtomValue(conversationsAtom)
  const [conversation, setConversation] = useState<ConversationType | null>(null)
  const chatRef = useRef<FlashListRef<MessageType>>(null!)
  const { height } = useGradualAnimation({ includeTabHeight: false })
  const [otherUser, setOtherUser] = useState<OtherUser>(null!)
  const detailOptions = useCustomHeader("", true, otherUser)

  useEffect(() => {
    if (!conversations || !user || !socket) return

    // Find the current conversation
    const conv = conversations.find(conv => conv._id === id)
    if (!conv) return

    setConversation(conv)
    setOtherUser(conv.members.find(member => member._id !== user._id)!)
    socket.emit("getMessages", id)
  }, [conversations, user, socket, id])

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
        <Feather name="plus" size={26} color={colors.dark} style={chatStyles.plusIcon} />
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
      </View>
    </View>
  )
}

const MemoizedMessageItem = memo(MessageItem)
