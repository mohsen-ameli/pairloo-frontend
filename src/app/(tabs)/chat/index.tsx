import { conversationStyles } from "@/src/styles/conversation.style"
import { conversationsAtom, unreadMessagesAtom } from "@/src/store/chat-store"
import { sinceNow } from "@/src/utils/format-date"
import { formatString } from "@/src/utils/format-string"
import { userAtom } from "@/src/store/auth-store"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useAtomValue } from "jotai"
import { Pressable, Text, View } from "react-native"
import { colors } from "@/src/utils/colors"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function index() {
  const router = useRouter()
  const conversations = useAtomValue(conversationsAtom)
  const user = useAtomValue(userAtom)
  const unreadMessages = useAtomValue(unreadMessagesAtom)

  return (
    <>
      <View style={conversationStyles.container}>
        {conversations.map(conversation => {
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
              style={conversationStyles.item}
              onPress={() => {
                router.push({
                  pathname: "/chat-details",
                  params: { id: conversation._id },
                })
              }}
            >
              <Image
                source={otherPerson.picture ? { uri: otherPerson.picture } : defaultProfilePicture}
                style={conversationStyles.image}
              />
              <View>
                <Text style={conversationStyles.itemTitle}>{otherPerson.username}</Text>
                {conversation.lastMessage && (
                  <Text style={conversationStyles.lastMessage}>
                    {conversation.lastMessage?.sender?._id === user?._id
                      ? "You"
                      : conversation.lastMessage?.sender?.username}
                    : {formatString(conversation.lastMessage?.content, 32)}
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
        })}
      </View>
    </>
  )
}
