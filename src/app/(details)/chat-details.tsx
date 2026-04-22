import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from "react-native"
import { useEffect, useRef, useState } from "react"
import { useLocalSearchParams, useRouter } from "expo-router/build/hooks"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Image } from "expo-image"
import {
  bigImageViewAtom,
  chatAttachmentsAtom,
  conversationsAtom,
  currentConversationAtom,
  currentLongPressedMessageAtom,
  entireChatLoadedAtom,
  highlightedMessageIdAtom,
  imgIndexAtom,
  loadingAtom,
  messagesAtom,
  receivedMsgAtom,
  replyingToAtom,
  sendMessageAtom,
} from "@/src/store/chat-store"
import { colors } from "@/src/utils/colors"
import { MessageType } from "@/src/types/chat.type"
import Feather from "@expo/vector-icons/Feather"
import MaterialIcons from "@expo/vector-icons/MaterialIcons"
import { formatDate } from "@/src/utils/format-date"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"
import { GestureDetector, Gesture } from "react-native-gesture-handler"
import useGradualAnimation from "@/src/utils/gradual-animation"
import { userAtom, userSecureAtom } from "@/src/store/auth-store"
import { chatStyles } from "@/src/styles/chat.styles"
import { chatSocketAtom } from "@/src/store/socket-store"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { Stack } from "expo-router"
import { FlashList, FlashListRef } from "@shopify/flash-list"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { scheduleOnRN } from "react-native-worklets"
import { NUM_MESSAGES_TO_LOAD } from "@/src/utils/constants"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function ChatDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const socket = useAtomValue(chatSocketAtom)
  const [message, setMessage] = useState<string>("")
  const [messages, setMessages] = useAtom(messagesAtom)
  const sendMessage = useSetAtom(sendMessageAtom)
  const user = useAtomValue(userAtom)
  const userJwt = useAtomValue(userSecureAtom)
  const conversations = useAtomValue(conversationsAtom)
  const setCurrentConversation = useSetAtom(currentConversationAtom)
  const [replyingTo, setReplyingTo] = useAtom(replyingToAtom)
  const chatRef = useRef<FlashListRef<MessageType>>(null)
  const inputRef = useRef<TextInput>(null)
  const { height } = useGradualAnimation({ includeTabHeight: false })
  const detailOptions = useCustomHeader("", true, true)
  const [loading, setLoading] = useAtom(loadingAtom)
  const attachments = useAtomValue(chatAttachmentsAtom)
  const otherUser = useRef<{
    _id: string
    username: string
    picture?: string | null | undefined
    email: string
  }>(undefined)
  const [canReview, setCanReview] = useState(false)
  const [entireChatLoaded, setEntireChatLoaded] = useAtom(entireChatLoadedAtom)
  const receivedMsg = useAtomValue(receivedMsgAtom)

  useEffect(() => {
    if (!conversations || !user || !socket || !userJwt) return

    setLoading(true)
    setEntireChatLoaded(false)

    // Find the current conversation
    const conv = conversations.find(c => c._id === id)

    if (!conv) return
    setCurrentConversation(conv)
    otherUser.current = conv.members.find(member => member._id !== userJwt._id)

    if (messages.length > 0) return
    socket.emit("getMessages", id, 0, NUM_MESSAGES_TO_LOAD)
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
    chatRef.current && chatRef.current.scrollToTop({ animated: true })
  }, [receivedMsg])

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
    await sendMessage(id, msg, replyingTo?._id)
  }

  // Animate fake view height
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value) - 15,
    }
  }, [])

  async function loadMoreMessages() {
    if (!socket || entireChatLoaded) return
    socket.emit("getMessages", id, messages.length, messages.length + NUM_MESSAGES_TO_LOAD)
  }

  return (
    <>
      <Stack.Screen options={detailOptions} />
      <LoadingIndicator loading={loading} />

      {/* Main chat */}
      <View style={chatStyles.container}>
        <FlashList
          inverted
          data={messages}
          ref={chatRef}
          keyboardDismissMode="on-drag"
          keyExtractor={item => item._id}
          onEndReached={loadMoreMessages}
          renderItem={({ item, index }) => (
            <>
              {/* Above the last message we show loading indicator since we'll be loading more chat messages */}
              {index === messages.length - 1 && !entireChatLoaded && (
                <ActivityIndicator
                  style={{ paddingVertical: 8 }}
                  size="small"
                  color={colors.blue}
                />
              )}
              <MessageItem
                item={item}
                inputRef={inputRef}
                isOwnMessage={userJwt?._id === item.sender._id}
              />
            </>
          )}
          ListFooterComponent={<View style={chatStyles.flatListFooter} />}
        />
      </View>

      <AttachmentPreview />

      {/* Reply Preview */}
      {replyingTo && (
        <View style={chatStyles.replyPreviewContainer}>
          <View style={chatStyles.replyPreviewHeader}>
            <View style={chatStyles.replyPreviewContent}>
              {replyingTo.attachments && replyingTo.attachments.length > 0 && (
                <Image
                  source={{ uri: replyingTo.attachments[0] }}
                  style={chatStyles.replyPreviewImage}
                />
              )}
              <View style={chatStyles.replyPreviewTextContainer}>
                <Text style={chatStyles.replyPreviewLabel}>
                  Replying to {replyingTo.sender.username}
                </Text>
                {replyingTo.content ? (
                  <Text style={chatStyles.replyPreviewText} numberOfLines={2}>
                    {replyingTo.content}
                  </Text>
                ) : replyingTo.attachments && replyingTo.attachments.length > 0 ? (
                  <Text style={chatStyles.replyPreviewImageText}>Image</Text>
                ) : null}
              </View>
            </View>
            <Pressable
              onPress={() => setReplyingTo(null)}
              style={chatStyles.replyPreviewCloseButton}
            >
              <Feather name="x" size={18} color={colors.gray} />
            </Pressable>
          </View>
        </View>
      )}

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
          ref={inputRef}
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

function MessageItem({
  item,
  inputRef,
  isOwnMessage,
}: {
  item: MessageType
  inputRef: React.RefObject<TextInput | null>
  isOwnMessage: boolean
}) {
  const setImgIdx = useSetAtom(imgIndexAtom)
  const setImages = useSetAtom(bigImageViewAtom)
  const setReplyingTo = useSetAtom(replyingToAtom)
  const setCurrentLongPressedMessage = useSetAtom(currentLongPressedMessageAtom)
  const replyingToAtomValue = useAtomValue(replyingToAtom)
  const [highlightedMessageId, setHighlightedMessageId] = useAtom(highlightedMessageIdAtom)
  const router = useRouter()
  const translateX = useSharedValue(0)
  const maxSwipeDistance = Dimensions.get("window").width * 0.25

  function focusOnInput() {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const panGesture = Gesture.Pan()
    .failOffsetY([-5, 5])
    .activeOffsetX([-15, 15])
    .onUpdate((event: any) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, -maxSwipeDistance)
      }
    })
    .onEnd((event: any) => {
      const threshold = maxSwipeDistance * 0.5

      if (event.translationX < -threshold) {
        translateX.value = withSpring(0)
        scheduleOnRN(setReplyingTo, item)
        scheduleOnRN(focusOnInput)
      } else {
        translateX.value = withSpring(0)
      }
    })

  const handleLongPress = () => {
    setHighlightedMessageId(item._id)
    setCurrentLongPressedMessage(item)
    router.push({
      pathname: "/message-action-modal",
      params: { isOwnMessage: String(isOwnMessage) },
    })
  }

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      scheduleOnRN(handleLongPress)
    })

  // Have a delay in order to allow rerendering highlight
  useEffect(() => {
    if (!highlightedMessageId) return
    const timer = setTimeout(() => {
      setHighlightedMessageId(null)
    }, 300)
    return () => clearTimeout(timer)
  }, [highlightedMessageId])

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    }
  })

  const replyButtonStyle = useAnimatedStyle(() => {
    const opacity = Math.min(Math.abs(translateX.value) / 80, 1)
    const scale = 0.5 + opacity * 0.5

    return {
      opacity,
      transform: [{ scale }],
    }
  })

  return (
    <View style={chatStyles.messageItem}>
      <Animated.View style={[chatStyles.replyButtonContainer, replyButtonStyle]}>
        <Pressable
          onPress={() => {
            setReplyingTo(item)
            translateX.value = withSpring(0)
          }}
          style={chatStyles.replyButton}
        >
          <MaterialIcons name="reply" size={20} color={colors.light} />
        </Pressable>
      </Animated.View>

      {/* Message content that swipes */}
      <GestureDetector gesture={Gesture.Simultaneous(panGesture, longPressGesture)}>
        <Animated.View
          style={[
            {
              ...chatStyles.messageContentAnimated,
              backgroundColor:
                highlightedMessageId === item._id || replyingToAtomValue?._id === item._id
                  ? colors.chatHighlight
                  : "transparent",
            },
            contentAnimatedStyle,
          ]}
        >
          <Image
            source={item.sender.picture ? { uri: item.sender.picture } : defaultProfilePicture}
            style={chatStyles.messageImage}
          />
          <View style={chatStyles.messageFlexContainer}>
            <View style={chatStyles.messageHeader}>
              <Text style={chatStyles.messageUsername}>{item.sender.username}</Text>
              <Text style={chatStyles.messageDate}>{formatDate(item.createdAt)}</Text>
            </View>
            {item.replyTo && (
              <View style={chatStyles.messageReplyContainer}>
                <View style={chatStyles.messageFlexContainer}>
                  <Text style={chatStyles.messageReplyText}>{item.replyTo.sender.username}</Text>
                  {item.replyTo.content ? (
                    <Text style={chatStyles.messageReplyContent} numberOfLines={2}>
                      {item.replyTo.content}
                    </Text>
                  ) : item.replyTo.attachments && item.replyTo.attachments.length > 0 ? (
                    <Text style={chatStyles.messageReplyImage}>Image</Text>
                  ) : null}
                </View>
                {item.replyTo.attachments && item.replyTo.attachments.length > 0 && (
                  <Image
                    source={{ uri: item.replyTo.attachments[0] }}
                    style={chatStyles.messageReplyThumbnail}
                  />
                )}
              </View>
            )}
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
              <View style={[chatStyles.messageAttachmentContainer, { alignItems: "flex-start" }]}>
                {item.attachments.map((att, idx) => {
                  const l = item.attachments?.length
                  const width = l === 1 ? 200 : l === 2 ? 150 : 100
                  return (
                    <View key={idx} style={chatStyles.attachmentItemContainer}>
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
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

function AttachmentPreview() {
  const [attachments, setAttachments] = useAtom(chatAttachmentsAtom)

  useEffect(() => {
    return () => {
      setAttachments([])
    }
  }, [])

  if (attachments.length === 0) return null

  return (
    <View style={chatStyles.attachmentPreviewContainer}>
      <FlatList
        data={attachments}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.uri}
        renderItem={({ item }) => (
          <View style={chatStyles.attachmentPreviewItem}>
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
