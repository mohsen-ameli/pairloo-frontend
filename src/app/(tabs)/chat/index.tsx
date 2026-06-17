import { conversationStyles } from "@/src/styles/conversation.style"
import {
  conversationsAtom,
  currentConversationAtom,
  initChatAtom,
  loadingAtom,
  prepareChatAtom,
  unreadMessagesAtom,
} from "@/src/store/chat-store"
import { sinceNow } from "@/src/utils/format-date"
import { formatString } from "@/src/utils/format-string"
import { userSecureAtom } from "@/src/store/auth-store"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useAtomValue, useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, View } from "react-native"
import { colors } from "@/src/utils/colors"
import { ConversationType, LastMessageType } from "@/src/types/socket/chat.type"
import { chatSocketAtom } from "@/src/store/socket-store"

import LoadingIndicator from "@/src/components/LoadingIndicator"
import { commonStyles } from "@/src/styles/common.styles"
import { Node } from "@/src/utils/linked-list"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function index() {
  const conversations = useAtomValue(conversationsAtom)

  const socket = useAtomValue(chatSocketAtom)
  const initChat = useSetAtom(initChatAtom)
  const loading = useAtomValue(loadingAtom)

  if (loading) {
    return (
      <View style={commonStyles.generalContainer}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (!socket) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={commonStyles.errorText}>An error occurred. Please try again.</Text>
        <Pressable style={commonStyles.retryButton} onPress={initChat}>
          <Text style={commonStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={commonStyles.generalContainer}>
      <ScrollView style={commonStyles.container}>
        {conversations.length === 0 ? (
          <View style={conversationStyles.emptyStateContainer}>
            <Text style={conversationStyles.emptyStateText}>No chats yet.</Text>
            <Text style={conversationStyles.emptyStateText}>
              Start a conversation by contacting someone!
            </Text>
          </View>
        ) : (
          <ConversationList />
        )}
      </ScrollView>
    </View>
  )
}

function ConversationList() {
  const conversations = useAtomValue(conversationsAtom)
  const setCurrentConversation = useSetAtom(currentConversationAtom)
  const prepareChat = useSetAtom(prepareChatAtom)
  const router = useRouter()
  const user = useAtomValue(userSecureAtom)
  const unreadMessages = useAtomValue(unreadMessagesAtom)

  function getLastMessagePreview(lastMessage: LastMessageType): string {
    if (!lastMessage || !user) return ""

    let contentPreview = ""
    if (lastMessage.attachmentsCount > 0) {
      contentPreview = "sent an attachment"
    } else {
      contentPreview = formatString(lastMessage.content, 32)
    }

    return `${lastMessage.sender.username}: ${contentPreview}`
  }

  function goToChat(conversation: Node<ConversationType | null>) {
    if (!conversation.value) return
    prepareChat(conversation.value._id, conversation.value.lastMessage?.postId)
    router.push("/chat-details")
    setCurrentConversation(conversation)
  }

  if (!user) return null

  return conversations.iterate(c => {
    const conversation = c.value
    if (!conversation) return null
    let otherPerson
    for (const member of conversation.members) {
      if (member._id !== user._id) {
        otherPerson = member
        break
      }
    }
    if (!otherPerson) return null

    const isUnread = conversation._id in unreadMessages

    return (
      <Pressable
        key={conversation._id}
        style={[commonStyles.card, conversationStyles.item]}
        onPress={() => goToChat(c)}
      >
        <Image
          source={otherPerson.picture ? { uri: otherPerson.picture } : defaultProfilePicture}
          style={conversationStyles.image}
        />
        <View style={conversationStyles.itemContent}>
          <Text style={conversationStyles.itemTitle}>{otherPerson.username}</Text>
          {conversation.lastMessage && (
            <Text
              style={[
                conversationStyles.lastMessage,
                {
                  fontSize: isUnread ? 15 : 14,
                  fontWeight: isUnread ? "700" : "400",
                },
              ]}
            >
              {getLastMessagePreview(conversation.lastMessage)}
            </Text>
          )}
        </View>
        <View style={conversationStyles.timestampContainer}>
          <Text
            style={[
              conversationStyles.timestamp,
              {
                color: isUnread ? colors.purple : colors.gray,
                fontWeight: isUnread ? "500" : "400",
              },
            ]}
          >
            {sinceNow(conversation.lastMessage?.updatedAt)}
          </Text>
          <Text>
            {isUnread && (
              <View style={conversationStyles.unreadBadge}>
                <Text style={conversationStyles.unreadBadgeText}>
                  {unreadMessages[conversation._id]}
                </Text>
              </View>
            )}
          </Text>
        </View>
      </Pressable>
    )
  })
}
