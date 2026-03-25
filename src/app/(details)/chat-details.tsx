import { View, Text, Pressable, TextInput, FlatList } from "react-native"
import { memo, useEffect, useRef, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Image } from "expo-image"
import {
  bigImageViewAtom,
  chatAttachmentsAtom,
  conversationsAtom,
  currentConversationAtom,
  imgIndexAtom,
  loadingAtom,
  messagesAtom,
  sendMessageAtom,
} from "@/src/store/chat-store"
import { colors } from "@/src/utils/colors"
import { MessageType } from "@/src/types/chat.type"
import Feather from "@expo/vector-icons/Feather"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { formatDate } from "@/src/utils/format-date"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import useGradualAnimation from "@/src/utils/gradual-animation"
import { userAtom, userJwtAtom } from "@/src/store/auth-store"
import { chatStyles } from "@/src/styles/chat.styles"
import { chatSocketAtom } from "@/src/store/socket-store"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"
import { FlashList, FlashListRef } from "@shopify/flash-list"
import LoadingIndicator from "@/src/components/LoadingIndicator"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function ChatDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const socket = useAtomValue(chatSocketAtom)
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useAtom(messagesAtom)
  const sendMessage = useSetAtom(sendMessageAtom)
  const user = useAtomValue(userAtom)
  const userJwt = useAtomValue(userJwtAtom)
  const conversations = useAtomValue(conversationsAtom)
  const setCurrentConversation = useSetAtom(currentConversationAtom)
  const chatRef = useRef<FlashListRef<MessageType>>(null)
  const { height } = useGradualAnimation({ includeTabHeight: false })
  const detailOptions = useCustomHeader("", true, true)
  const loading = useAtomValue(loadingAtom)
  const attachments = useAtomValue(chatAttachmentsAtom)
  const otherUser = useRef<{
    _id: string
    username: string
    picture?: string | null | undefined
    email: string
  }>(undefined)
  const [canReview, setCanReview] = useState(false)

  useEffect(() => {
    if (!conversations || !user || !socket || !userJwt) return

    // Find the current conversation
    const conv = conversations.find(c => c._id === id)

    if (!conv) return
    setCurrentConversation(conv)
    otherUser.current = conv.members.find(member => member._id !== userJwt._id)

    if (messages.length > 0) return
    socket.emit("getMessages", id)
  }, [conversations, user, socket, id])

  useEffect(() => {
    for (const msg of messages) {
      if (msg.sender._id === otherUser.current?._id) {
        setCanReview(true)
        break
      }
    }
  }, [messages])

  useEffect(() => {
    return () => {
      setMessages([])
      setCurrentConversation(null)
    }
  }, [])

  async function handleSendMessage() {
    const msg = message.trim()
    if (!msg && attachments.length === 0) return
    setMessage("")
    await sendMessage(id, msg)
    chatRef.current && chatRef.current.scrollToEnd({ animated: false })
  }

  // Animate fake view height
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value) - 15,
    }
  }, [])

  return (
    <>
      <Stack.Screen options={detailOptions} />
      <LoadingIndicator loading={loading} />

      {/* Main chat */}
      <View style={chatStyles.container}>
        <FlashList
          data={messages}
          ref={chatRef}
          keyboardDismissMode="on-drag"
          onLayout={() => chatRef.current && chatRef.current.scrollToEnd({ animated: false })}
          keyExtractor={item => item._id}
          renderItem={({ item }) => <MemoizedMessageItem item={item} />}
          ListFooterComponent={<View style={{ height: 16 }} />}
        />
      </View>

      <AttachmentPreview />

      {/* Input Area */}
      <View style={chatStyles.inputContainer}>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/attachment-picker",
              params: { intent: "chat" },
            })
          }
          style={chatStyles.actionButton}
        >
          <Feather name="plus" size={24} color={colors.light} />
        </Pressable>
        {message.trim() === "" && canReview && (
          <Pressable
            onPress={() =>
              router.push({ pathname: "review-user", params: { id: otherUser.current?._id } })
            }
            style={chatStyles.actionButton}
          >
            <MaterialIcons name="rate-review" size={20} color={colors.light} />
          </Pressable>
        )}
        <TextInput
          style={chatStyles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          value={message}
          onChangeText={text => setMessage(text)}
        />
        <Pressable
          style={[
            chatStyles.actionButton,
            { display: message.trim() || attachments.length > 0 ? "flex" : "none" },
          ]}
          onPress={handleSendMessage}
        >
          <Feather name="send" size={22} color={colors.lightGray} />
        </Pressable>
      </View>

      {/* Push the content up after keyboard appears */}
      <Animated.View style={[fakeView, { backgroundColor: colors.lightGray }]} />
    </>
  )
}

function MessageItem({ item }: { item: MessageType }) {
  const setImgIdx = useSetAtom(imgIndexAtom)
  const setImages = useSetAtom(bigImageViewAtom)
  const router = useRouter()

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
        {item.attachments && (
          <View style={chatStyles.messageAttachmentContainer}>
            {item.attachments.map((att, idx) => {
              const l = item.attachments?.length
              const width = l === 1 ? 200 : l === 2 ? 150 : 100
              return (
                <View key={idx} style={{ marginTop: 8 }}>
                  <Pressable
                    onPress={() => {
                      setImgIdx(idx)
                      setImages(
                        item.attachments!.map((att, id) => ({
                          uri: att,
                          id: id.toString(),
                        }))
                      )
                      router.push("/image-gallery")
                    }}
                  >
                    <Image
                      source={{ uri: att }}
                      style={{
                        width: width,
                        height: width,
                        maxWidth: 300,
                        maxHeight: 300,
                        borderRadius: 10,
                      }}
                    />
                  </Pressable>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}
const MemoizedMessageItem = memo(MessageItem)

function AttachmentPreview() {
  const [attachments, setAttachments] = useAtom(chatAttachmentsAtom)

  useEffect(() => {
    return () => {
      setAttachments([])
    }
  }, [])

  if (attachments.length === 0) return null

  return (
    <View style={{ backgroundColor: colors.light, padding: 8 }}>
      <FlatList
        data={attachments}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.uri}
        renderItem={({ item }) => (
          <View style={{ marginRight: 10 }}>
            <Image
              source={{ uri: item.uri }}
              style={chatStyles.attachmentPreviewImage}
              contentFit="cover"
              allowDownscaling
            />
            <Pressable
              style={chatStyles.attachmentRemoveButton}
              onPress={() => {
                setAttachments(attachments.filter(att => att.uri !== item.uri))
              }}
            >
              <Feather name="x" size={20} color={colors.dark} />
            </Pressable>
          </View>
        )}
      />
    </View>
  )
}
