import { View, Text, Pressable, TextInput, Modal, TouchableOpacity, FlatList } from "react-native"
import { memo, useEffect, useRef, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks"
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai"
import { Image } from "expo-image"
import {
  conversationsAtom,
  currentConversationAtom,
  messagesAtom,
  sendMessageAtom,
} from "@/src/store/chat-store"
import { colors } from "@/src/utils/colors"
import { MessageType, OtherUser } from "@/src/types/chat.type"
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
import useImageAspectRatio from "@/src/utils/useImageAspectRatio"
import ImageView from "react-native-image-viewing"
import LoadingIndicator from "@/src/components/LoadingIndicator"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

const visibleAtom = atom(false)
const imgIndexAtom = atom(0)

export default function ChatDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const socket = useAtomValue(chatSocketAtom)
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useAtom(messagesAtom)
  const sendMessage = useSetAtom(sendMessageAtom)
  const user = useAtomValue(userAtom)
  const conversations = useAtomValue(conversationsAtom)
  const [conversation, setConversation] = useAtom(currentConversationAtom)
  const chatRef = useRef<FlashListRef<MessageType>>(null)
  const { height } = useGradualAnimation({ includeTabHeight: false })
  const [otherUser, setOtherUser] = useState<OtherUser>(null!)
  const detailOptions = useCustomHeader("", true, otherUser)
  const [visible, setIsVisible] = useAtom(visibleAtom)
  const imgIndex = useAtomValue(imgIndexAtom)
  const [images, setImages] = useState<{ uri: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (messages) {
      // This runs every time new messages come in
      // It can be improved for efficiency
      const imgs = messages
        .filter(msg => msg.attachmentUrl)
        .map(msg => ({ uri: msg.attachmentUrl! }))
      setImages(imgs)
      chatRef.current?.scrollToEnd({ animated: false })
      setLoading(false)
    }
  }, [messages])

  useEffect(() => {
    if (!conversations || !user || !socket) return

    // Find the current conversation
    const conv = conversations.find(conv => conv._id === id)

    // If we already have messages, don't fetch again
    if (!conv || messages.length > 0) return

    setConversation(conv)
    setOtherUser(conv.members.find(member => member._id !== user._id)!)
    setLoading(true)
    socket.emit("getMessages", id)
  }, [conversations, user, socket, id, messages])

  useFocusEffect(() => {
    return () => {
      setConversation(null)
      setOtherUser(null!)
      setLoading(false)
      setMessages([])
    }
  })

  async function handleSendMessage() {
    const msg = message.trim()
    if (!msg) return
    setMessage("")
    await sendMessage(id, msg)
    chatRef.current?.scrollToEnd({ animated: false })
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
      <LoadingIndicator loading={loading} />

      <ImageView
        images={images}
        imageIndex={imgIndex}
        visible={visible}
        onRequestClose={() => setIsVisible(false)}
        HeaderComponent={({ imageIndex }) => (
          <View style={chatStyles.imageHeader}>
            <TouchableOpacity
              style={chatStyles.imageHeaderButton}
              onPress={() => setIsVisible(false)}
            >
              <Feather name="x" size={25} color={colors.dark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={chatStyles.imageHeaderButton}
              onPress={() => setIsVisible(false)}
            >
              <Feather name="menu" size={25} color={colors.dark} />
            </TouchableOpacity>
          </View>
        )}
        // FooterComponent={({ imageIndex }) => (
        //   <View style={chatStyles.imageFooter}>
        //     <FlatList
        //       data={images}
        //       horizontal
        //       showsHorizontalScrollIndicator={false}
        //       keyExtractor={(item, idx) => item.uri}
        //       renderItem={({ item }) => (
        //         <Pressable
        //           onPress={() => {
        //             setImgIdx(images.findIndex(img => img.uri === item.uri))
        //           }}
        //         >
        //           <Image
        //             source={{ uri: item.uri }}
        //             style={{
        //               width: 20,
        //               height: 40,
        //               marginHorizontal: item.uri === images[imageIndex].uri ? 10 : 1,
        //             }}
        //             allowDownscaling
        //           />
        //         </Pressable>
        //       )}
        //     />
        //   </View>
        // )}
      />

      <View style={chatStyles.container}>
        <FlashList
          data={messages}
          ref={chatRef}
          keyboardDismissMode="on-drag"
          onLayout={() => chatRef.current?.scrollToEnd({ animated: false })}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <MemoizedMessageItem
              item={item}
              imageIndex={
                item.attachmentUrl ? images.findIndex(img => img.uri === item.attachmentUrl) : null
              }
            />
          )}
          ListFooterComponent={<View style={{ height: 16 }} />}
        />
      </View>

      {/* Input Area */}
      <View style={chatStyles.inputContainer}>
        <Pressable onPress={() => router.push("/attachment-picker")} style={chatStyles.plusButton}>
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
    </>
  )
}

function MessageItem({ item, imageIndex }: { item: MessageType; imageIndex: number | null }) {
  const aspectRatio = useImageAspectRatio(item.attachmentUrl || "")
  const setIsVisible = useSetAtom(visibleAtom)
  const setImgIdx = useSetAtom(imgIndexAtom)

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
        {item.attachmentUrl && imageIndex && (
          <Pressable
            onPress={() => {
              setImgIdx(imageIndex)
              setIsVisible(true)
            }}
          >
            <Image
              source={{ uri: item.attachmentUrl }}
              style={[
                chatStyles.messageAttachment,
                {
                  aspectRatio,
                },
              ]}
            />
          </Pressable>
        )}
      </View>
    </View>
  )
}

const MemoizedMessageItem = memo(MessageItem)
