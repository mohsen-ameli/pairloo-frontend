import {
  View,
  Text,
  Pressable,
  TextInput,
  Dimensions,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from "react-native"
import { useCallback, useEffect, useRef, useState } from "react"
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
  editingMessageAtom,
} from "@/src/store/chat-store"
import { colors } from "@/src/utils/colors"
import { MessageType } from "@/src/types/socket/chat.type"
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
import { Stack, useFocusEffect } from "expo-router"
import { FlashList, FlashListRef } from "@shopify/flash-list"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { scheduleOnRN } from "react-native-worklets"
import { NUM_MESSAGES_TO_LOAD } from "@/src/utils/constants"
import { atom } from "jotai"

const scrollTargetIdAtom = atom<string | null>(null)

export default function ChatDetails() {
  const router = useRouter()
  const { conversationId, postId } = useLocalSearchParams<{
    conversationId: string
    postId?: string
  }>()
  const socket = useAtomValue(chatSocketAtom)
  const [message, setMessage] = useState<string>("")
  const [inputHeight, setInputHeight] = useState<number>(40)
  const [messages, setMessages] = useAtom(messagesAtom)
  const sendMessage = useSetAtom(sendMessageAtom)
  const user = useAtomValue(userAtom)
  const userJwt = useAtomValue(userSecureAtom)
  const conversations = useAtomValue(conversationsAtom)
  const [currentConversation, setCurrentConversation] = useAtom(currentConversationAtom)
  const [replyingTo, setReplyingTo] = useAtom(replyingToAtom)
  const [editingMessage, setEditingMessage] = useAtom(editingMessageAtom)
  const chatRef = useRef<FlashListRef<MessageType>>(null)
  const inputRef = useRef<TextInput>(null!)
  const { height } = useGradualAnimation({ includeTabHeight: false })
  const detailOptions = useCustomHeader({ title: "", inChat: true })
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
  const [scrollTargetId, setScrollTargetId] = useAtom(scrollTargetIdAtom)
  const setHighlightedMessageId = useSetAtom(highlightedMessageIdAtom)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)

  // Handle automatic scrolling to replied messages
  useEffect(() => {
    if (!scrollTargetId || !chatRef.current) return

    const targetIndex = messages.findIndex(msg => msg._id === scrollTargetId)

    if (targetIndex !== -1) {
      chatRef.current.scrollToIndex({
        index: targetIndex,
        animated: true,
        viewPosition: 0.5,
      })

      setTimeout(() => {
        setHighlightedMessageId(scrollTargetId)
      }, 500)

      setScrollTargetId(null)
    } else {
      if (!entireChatLoaded && socket) {
        loadMoreMessages()
      } else if (entireChatLoaded) {
        Alert.alert("Error", "The original message could not be found.")
        setScrollTargetId(null)
      }
    }
  }, [messages, scrollTargetId, entireChatLoaded, socket])

  // Checking if the user is allowed to review (only if they have received a message from the other user)
  useEffect(() => {
    if (canReview) return
    for (const msg of messages) {
      if (msg.sender._id === otherUser.current?._id) {
        setCanReview(true)
        break
      }
    }
  }, [messages])

  // Scroll to bottom when a new message is received
  useEffect(() => {
    // delay to ensure the list has been re-rendered
    const timer = setTimeout(() => {
      chatRef.current?.scrollToTop({ animated: true })
    }, 100)

    return () => clearTimeout(timer)
  }, [receivedMsg])

  // When a message is selected for editing, populate the input
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content)
      inputRef.current.focus()
    }
  }, [editingMessage])

  // To set the current conversation and load initial messages
  useFocusEffect(
    useCallback(() => {
      if (!user || !socket || !userJwt) return

      if (!currentConversation) {
        // Find the current conversation
        const conv = conversations.find(c => c._id === conversationId)
        if (!conv) return
        setCurrentConversation({ ...conv, activePostId: postId })

        otherUser.current = conv.members.find(member => member._id !== userJwt._id)
      }

      if (messages.length > 0) return

      setLoading(true)
      setEntireChatLoaded(false)

      socket.emit("getMessages", { conversationId, postId, start: 0, end: NUM_MESSAGES_TO_LOAD })
    }, [user, socket, conversationId, postId])
  )

  // Cleanup on unmount
  useFocusEffect(
    useCallback(() => {
      return () => {
        setMessages([])
        setCurrentConversation(null)
        setScrollTargetId(null)
        setEntireChatLoaded(false)
        setLoading(false)
      }
    }, [])
  )

  async function handleSendMessage() {
    setMessage("")
    await sendMessage(message.trim())
  }

  // Animate fake view height
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value) - 20,
    }
  }, [])

  const botAnimation = useAnimatedStyle(() => {
    return {
      bottom: Math.abs(height.value) + 100,
    }
  }, [])

  async function loadMoreMessages() {
    if (!socket || entireChatLoaded || loading || !currentConversation) return
    // if we have already sent a request to load more messages, don't send another one until we get a response
    socket.emit("getMessages", {
      conversationId,
      postId: currentConversation?.activePostId,
      start: messages.length,
      end: messages.length + NUM_MESSAGES_TO_LOAD,
    })
  }

  return (
    <>
      <Stack.Screen options={detailOptions} />
      <LoadingIndicator loading={loading} opacity={0.5} />

      <FlashList
        inverted
        data={messages}
        ref={chatRef}
        keyboardDismissMode="on-drag"
        style={chatStyles.container}
        keyExtractor={item => item._id}
        onEndReached={loadMoreMessages}
        scrollIndicatorInsets={{ left: 10 }}
        contentContainerStyle={{ paddingTop: 10, paddingBottom: 20, paddingHorizontal: 5 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <>
            {/* Above the last message we show loading indicator since we'll be loading more chat messages */}
            {index === messages.length - 1 && !entireChatLoaded && (
              <ActivityIndicator style={{ paddingVertical: 8 }} size="small" color={colors.blue} />
            )}
            <MessageItem
              item={item}
              messages={messages}
              chatRef={chatRef}
              inputRef={inputRef}
              isOwnMessage={userJwt?._id === item.sender._id}
            />
          </>
        )}
        ListFooterComponent={<View style={chatStyles.listFooter} />}
        onScroll={event => {
          const offsetY = event.nativeEvent.contentOffset.y
          setShowScrollToBottom(offsetY > 1000)
        }}
      />

      {showScrollToBottom && (
        <Animated.View style={[{ position: "absolute", right: 20, zIndex: 2 }, botAnimation]}>
          <TouchableOpacity
            onPress={() => chatRef.current?.scrollToTop({ animated: true })}
            style={chatStyles.scrollToBottomButton}
          >
            <Feather name="arrow-down" size={24} color={colors.dark} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <AttachmentPreview />

      {/* Reply Preview */}
      {replyingTo && (
        <View style={chatStyles.replyPreviewContainer}>
          <View style={chatStyles.replyPreviewHeader}>
            <View style={chatStyles.replyPreviewContent}>
              <View style={chatStyles.replyPreviewTextContainer}>
                <Text style={chatStyles.replyPreviewLabel}>
                  Replying to {replyingTo.sender.username}
                </Text>
                {replyingTo.content ? (
                  <Text style={chatStyles.replyPreviewText} numberOfLines={2}>
                    {replyingTo.content}
                  </Text>
                ) : replyingTo.attachmentsCount > 0 ? (
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

      {/* Editing Indicator */}
      {editingMessage && (
        <View style={chatStyles.editingIndicatorContainer}>
          <Pressable
            onPress={() => {
              setEditingMessage(null)
              setMessage("")
            }}
            style={{ backgroundColor: colors.light, padding: 4, borderRadius: 50 }}
          >
            <Feather name="x" size={18} color={colors.gray} />
          </Pressable>
          <Text style={{ color: colors.gray, fontSize: 12, flex: 1, marginLeft: 8 }}>
            Editing message
          </Text>
        </View>
      )}

      {/* Input Area */}
      <View style={chatStyles.inputContainer}>
        <Pressable
          onPress={() => {
            Keyboard.dismiss()
            router.push({
              pathname: "/attachment-picker",
              params: { intent: "chat" },
            })
          }}
          style={chatStyles.actionButton}
        >
          <Feather name="plus" size={24} color={colors.light} />
        </Pressable>
        {message.trim() === "" && canReview && !editingMessage && (
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
          style={[chatStyles.input, { height: Math.max(40, inputHeight) }]}
          placeholder="Type a message..."
          placeholderTextColor={colors.muted}
          value={message}
          onChangeText={text => setMessage(text)}
          onContentSizeChange={event => {
            setInputHeight(event.nativeEvent.contentSize.height)
          }}
          multiline
          maxLength={500}
          ref={inputRef}
        />
        {editingMessage ? (
          <Pressable onPress={handleSendMessage} style={chatStyles.actionButton}>
            <Feather name="send" size={22} color={colors.lightGray} />
          </Pressable>
        ) : (
          <Pressable
            style={[
              chatStyles.actionButton,
              { display: message.trim() || attachments.length > 0 ? "flex" : "none" },
            ]}
            onPress={handleSendMessage}
          >
            <Feather name="send" size={22} color={colors.lightGray} />
          </Pressable>
        )}
      </View>

      {/* Push the content up after keyboard appears */}
      <Animated.View style={[fakeView, { backgroundColor: colors.lightGray }]} />
    </>
  )
}

function MessageItem({
  item,
  messages,
  chatRef,
  inputRef,
  isOwnMessage,
}: {
  item: MessageType
  messages: MessageType[]
  chatRef: React.RefObject<FlashListRef<MessageType> | null>
  inputRef: React.RefObject<TextInput | null>
  isOwnMessage: boolean
}) {
  const router = useRouter()
  const setImgIdx = useSetAtom(imgIndexAtom)
  const setImages = useSetAtom(bigImageViewAtom)
  const [replyingTo, setReplyingTo] = useAtom(replyingToAtom)
  const setCurrentLongPressedMessage = useSetAtom(currentLongPressedMessageAtom)
  const [highlightedMessageId, setHighlightedMessageId] = useAtom(highlightedMessageIdAtom)
  const setScrollTargetId = useSetAtom(scrollTargetIdAtom)
  const translateX = useSharedValue(0)
  const maxSwipeDistance = Dimensions.get("window").width * 0.25

  // scroll to the original replied message
  const scrollToReplyMessage = () => {
    if (!item.replyTo || !chatRef.current) return

    const originalMessageIndex = messages.findIndex(msg => msg._id === item.replyTo?._id)
    if (originalMessageIndex === -1) {
      setScrollTargetId(item.replyTo._id)
      return
    }

    chatRef.current
      ?.scrollToIndex({
        index: originalMessageIndex,
        animated: true,
        viewPosition: 0.5,
      })
      .then(() => {
        setHighlightedMessageId(item.replyTo!._id)
      })
  }

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
        scheduleOnRN(setReplyingTo, {
          _id: item._id,
          content: item.content,
          attachmentsCount: item.attachments?.length || 0,
          sender: item.sender,
        })
        scheduleOnRN(focusOnInput)
      } else {
        translateX.value = withSpring(0)
      }
    })

  const handleLongPress = () => {
    Keyboard.dismiss()
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
    }, 500)
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
            setReplyingTo({
              _id: item._id,
              content: item.content,
              attachmentsCount: item.attachments?.length || 0,
              sender: item.sender,
            })
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
            chatStyles.messageContentAnimated,
            {
              alignItems: isOwnMessage ? "flex-end" : "flex-start",
            },
            contentAnimatedStyle,
          ]}
        >
          <View
            style={[
              chatStyles.messageBubble,
              isOwnMessage ? chatStyles.ownMessageBubble : chatStyles.otherMessageBubble,
              {
                backgroundColor:
                  highlightedMessageId === item._id || replyingTo?._id === item._id
                    ? isOwnMessage
                      ? colors.chatHighlightOwnBubble
                      : colors.chatHighlightOtherBubble
                    : isOwnMessage
                      ? colors.purple
                      : colors.lightGray,
                overflow: "hidden",
                maxWidth: item.attachments && item.attachments.length > 1 ? "80%" : "70%",
              },
            ]}
          >
            {/* Reply section inside bubble */}
            {item.replyTo && (
              <Pressable
                onPress={scrollToReplyMessage}
                style={[
                  chatStyles.messageReplyContainer,
                  item.attachments &&
                    item.attachments.length > 0 && { marginTop: 8, marginHorizontal: 10 },
                  {
                    backgroundColor: isOwnMessage
                      ? "rgba(255, 255, 255, 0.2)"
                      : "rgba(0, 0, 0, 0.1)",
                    borderLeftColor: isOwnMessage ? colors.light : colors.purple,
                  },
                ]}
              >
                <View style={chatStyles.messageFlexContainer}>
                  <Text
                    style={[
                      chatStyles.messageReplyText,
                      {
                        color: isOwnMessage ? colors.light : colors.gray,
                      },
                    ]}
                  >
                    {item.replyTo.sender.username}
                  </Text>
                  {item.replyTo.content ? (
                    <Text
                      style={[
                        chatStyles.messageReplyContent,
                        {
                          color: isOwnMessage ? colors.light : colors.dark,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {item.replyTo.content}
                    </Text>
                  ) : item.replyTo.attachmentsCount > 0 ? (
                    <Text
                      style={[
                        chatStyles.messageReplyImage,
                        {
                          color: isOwnMessage ? colors.light : colors.gray,
                        },
                      ]}
                    >
                      {item.replyTo.attachmentsCount} Attachments
                    </Text>
                  ) : null}
                </View>
              </Pressable>
            )}

            {/* Attachments */}
            {item.attachments && item.attachments.length > 0 && (
              <View style={chatStyles.messageAttachmentContainer}>
                {item.attachments.slice(0, 2).map((att, idx) => {
                  const l = item.attachments?.length || 1

                  // Calculate exact widths to fit side-by-side cleanly inside the max-width
                  let width: number
                  if (l === 1) {
                    width = 240
                  } else {
                    width = 140
                  }

                  const hasMoreImages = l > 2
                  const showOverlay = hasMoreImages && idx === 1

                  return (
                    <View key={idx} style={{ position: "relative" }}>
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
                            marginBottom: 5,
                          }}
                        />
                        {showOverlay && (
                          <View style={chatStyles.shadowOverlay}>
                            <Text style={{ color: "white", fontSize: 24, fontWeight: "bold" }}>
                              +{l - 2}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    </View>
                  )
                })}
              </View>
            )}

            {/* Main message content */}
            {item.content && (
              <Text
                style={[
                  chatStyles.messageContent,
                  isOwnMessage ? chatStyles.ownMessageText : chatStyles.otherMessageText,
                ]}
              >
                {item.content}{" "}
                {item.isEdited && <Text style={chatStyles.editedLabel}>(edited)</Text>}
              </Text>
            )}

            {/* Timestamp */}
            <Text
              style={[
                chatStyles.messageDate,
                isOwnMessage ? chatStyles.ownMessageDate : chatStyles.otherMessageDate,
              ]}
            >
              {formatDate(item.createdAt)}
            </Text>
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
      <FlashList
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
