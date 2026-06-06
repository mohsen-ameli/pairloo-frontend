import { conversationStyles } from "@/src/styles/conversation.style"
import {
  conversationsAtom,
  initChatAtom,
  loadingAtom,
  prepareChatAtom,
  unreadMessagesAtom,
} from "@/src/store/chat-store"
import { sinceNow } from "@/src/utils/format-date"
import { formatString } from "@/src/utils/format-string"
import { userSecureAtom } from "@/src/store/auth-store"
import { Image } from "expo-image"
import { useFocusEffect, useRouter } from "expo-router"
import { useAtomValue, useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, View } from "react-native"
import { colors } from "@/src/utils/colors"
import { LastMessageType } from "@/src/types/socket/chat.type"
import { chatSocketAtom } from "@/src/store/socket-store"

import LoadingIndicator from "@/src/components/LoadingIndicator"
import { useCallback } from "react"
import { commonStyles } from "@/src/styles/common.styles"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function index() {
  const router = useRouter()
  const conversations = useAtomValue(conversationsAtom)
  const user = useAtomValue(userSecureAtom)
  const unreadMessages = useAtomValue(unreadMessagesAtom)
  const socket = useAtomValue(chatSocketAtom)
  const initChat = useSetAtom(initChatAtom)
  const loading = useAtomValue(loadingAtom)
  const prepareChat = useSetAtom(prepareChatAtom)

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

  async function refresh() {
    await initChat()
  }

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [])
  )

  if (loading) {
    return (
      <View style={commonStyles.generalContainer}>
        <LoadingIndicator loading={true} />
      </View>
    )
  }

  if (!socket || socket.connected === false) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={commonStyles.errorText}>An error occured. Please try again.</Text>
        <Pressable style={commonStyles.retryButton} onPress={refresh}>
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
          conversations.map(conversation => {
            let otherPerson
            for (const member of conversation.members) {
              if (member._id !== user?._id) {
                otherPerson = member
                break
              }
            }
            if (!otherPerson) return null

            return (
              <Pressable
                key={conversation._id}
                style={[commonStyles.card, conversationStyles.item]}
                onPress={() => {
                  prepareChat(conversation.lastMessage?.postId)
                  router.push({
                    pathname: "/chat-details",
                    params: { conversationId: conversation._id },
                  })
                }}
              >
                <Image
                  source={
                    otherPerson.picture ? { uri: otherPerson.picture } : defaultProfilePicture
                  }
                  style={conversationStyles.image}
                />
                <View>
                  <Text style={conversationStyles.itemTitle}>{otherPerson.username}</Text>
                  {conversation.lastMessage && (
                    <Text style={conversationStyles.lastMessage}>
                      {getLastMessagePreview(conversation.lastMessage)}
                    </Text>
                  )}
                </View>
                <View style={conversationStyles.timestampContainer}>
                  <Text
                    style={[
                      conversationStyles.timestamp,
                      {
                        color: conversation._id in unreadMessages ? colors.purple : colors.gray,
                        fontWeight: conversation._id in unreadMessages ? "500" : "400",
                      },
                    ]}
                  >
                    {sinceNow(conversation.lastMessage?.updatedAt)}
                  </Text>
                  <Text>
                    {conversation._id in unreadMessages && unreadMessages[conversation._id] > 0 && (
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
        )}
      </ScrollView>
    </View>
  )
}
