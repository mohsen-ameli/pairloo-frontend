import { View, Text, Pressable, TextInput, FlatList, Dimensions, Alert } from "react-native"
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
  editingMessageAtom,
  editMessageAtom,
  deleteMessageAtom,
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

export default function ChatDetails() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const socket = useAtomValue(chatSocketAtom)
  const [message, setMessage] = useState<string>("")
  const [inputHeight, setInputHeight] = useState<number>(40)
  const [messages, setMessages] = useAtom(messagesAtom)
  const sendMessage = useSetAtom(sendMessageAtom)
  const editMessage = useSetAtom(editMessageAtom)
  const user = useAtomValue(userAtom)
  const userJwt = useAtomValue(userSecureAtom)
  const conversations = useAtomValue(conversationsAtom)
  const setCurrentConversation = useSetAtom(currentConversationAtom)
  const [replyingTo, setReplyingTo] = useAtom(replyingToAtom)
  const [editingMessage, setEditingMessage] = useAtom(editingMessageAtom)
  const deleteMessage = useSetAtom(deleteMessageAtom)
  const chatRef = useRef<FlashListRef<MessageType>>(null)
  const inputRef = useRef<TextInput>(null)
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
  const entireChatLoaded = useAtomValue(entireChatLoadedAtom)
  const receivedMsg = useAtomValue(receivedMsgAtom)

  useEffect(() => {
    if (!conversations || !user || !socket || !userJwt) return

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

  // When a message is selected for editing, populate the input
  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content || "")
      inputRef.current?.focus()
    }
  }, [editingMessage])

  async function handleSendMessage() {
    const msg = message.trim()
    if (!editingMessage && !msg && attachments.length === 0) return

    if (editingMessage) {
      if (msg === editingMessage.content) {
        // No changes, just cancel editing
        setEditingMessage(null)
        setMessage("")
        return
      }

      // If message is empty, show delete confirmation alert
      if (!msg) {
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
                await deleteMessage(editingMessage._id, editingMessage.conversationId)
                setEditingMessage(null)
                setMessage("")
              } catch (error) {
                console.error("Delete error:", error)
                Alert.alert("Error", "Failed to delete message")
              }
            },
            style: "destructive",
          },
        ])
        return
      }

      await editMessage(editingMessage._id, editingMessage.conversationId, msg)
      setEditingMessage(null)
      setMessage("")
    } else {
      // Normal message sending
      setMessage("")
      await sendMessage(id, msg, replyingTo?._id)
    }
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
          scrollIndicatorInsets={{ left: 10 }}
          renderItem={({ item, index }) => (
            <MessageItem
              item={item}
              inputRef={inputRef}
              isOwnMessage={userJwt?._id === item.sender._id}
            />
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
                  highlightedMessageId === item._id || replyingToAtomValue?._id === item._id
                    ? colors.chatHighlight
                    : isOwnMessage
                      ? colors.purple
                      : colors.lightGray,
              },
            ]}
          >
            {/* Reply section inside bubble */}
            {item.replyTo && (
              <View
                style={[
                  chatStyles.messageReplyContainer,
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
                  ) : item.replyTo.attachments && item.replyTo.attachments.length > 0 ? (
                    <Text
                      style={[
                        chatStyles.messageReplyImage,
                        {
                          color: isOwnMessage ? colors.light : colors.gray,
                        },
                      ]}
                    >
                      Image
                    </Text>
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

            {/* Main message content */}
            {item.content && (
              <Text
                style={[
                  chatStyles.messageContent,
                  isOwnMessage ? chatStyles.ownMessageText : chatStyles.otherMessageText,
                  {
                    opacity: item.optimistic ? 0.6 : 1,
                  },
                ]}
              >
                {item.content}
              </Text>
            )}

            {/* Attachments */}
            {item.attachments && (
              <View style={chatStyles.messageAttachmentContainer}>
                {item.attachments.map((att, idx) => {
                  const l = item.attachments?.length
                  const width = l === 1 ? 180 : l === 2 ? 140 : 90
                  return (
                    <View key={idx}>
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
                            maxWidth: 280,
                            maxHeight: 280,
                            borderRadius: 10,
                            marginBottom: 5,
                          }}
                        />
                      </Pressable>
                    </View>
                  )
                })}
              </View>
            )}

            {/* Timestamp */}
            <Text
              style={[
                chatStyles.messageDate,
                {
                  fontSize: 10,
                  marginTop: item.content || item.attachments ? 4 : 0,
                },
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
