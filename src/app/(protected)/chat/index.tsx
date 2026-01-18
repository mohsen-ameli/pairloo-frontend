import { conversationStyles } from "@/src/styles/conversation.style";
import { conversationsAtom, unreadMessagesAtom } from "@/src/store/chat-store";
import { sinceNow } from "@/src/utils/format-date";
import { formatString } from "@/src/utils/format-string";
import { userAtom } from "@/src/store/auth-store";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { colors } from "@/src/utils/colors";

export default function index() {
  const router = useRouter();
  const conversations = useAtomValue(conversationsAtom);
  const { redirect } = useLocalSearchParams();
  const user = useAtomValue(userAtom);
  const unreadMessages = useAtomValue(unreadMessagesAtom);

  useEffect(() => {
    if (redirect) {
      router.push(redirect as string);
      router.setParams({ redirect: undefined });
    }
  }, [redirect]);

  return (
    <>
      <View style={conversationStyles.container}>
        {conversations.map((conversation) => {
          let otherPerson;
          for (const member of conversation.members) {
            if (member._id !== user?._id) {
              otherPerson = member;
              break;
            }
          }
          if (!otherPerson) return null;

          return (
            <Pressable
              key={conversation._id}
              style={conversationStyles.item}
              onPress={() => {
                router.push(`/chat/${conversation._id}`);
              }}
            >
              {otherPerson.picture && (
                <Image
                  source={{ uri: otherPerson.picture }}
                  style={conversationStyles.image}
                />
              )}
              <View>
                <Text style={conversationStyles.itemTitle}>
                  {otherPerson.username}
                </Text>
                {conversation.lastMessage && (
                  <Text style={conversationStyles.lastMessage}>
                    {conversation.lastMessage?.sender?._id === user?._id
                      ? "You"
                      : conversation.lastMessage?.sender?.username}
                    : {formatString(conversation.lastMessage?.content, 32)}
                  </Text>
                )}
              </View>
              <View
                style={{
                  position: "absolute",
                  right: 10,
                  top: 10,
                  bottom: 10,
                  flexDirection: "column",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={[
                    conversationStyles.timestamp,
                    {
                      color:
                        conversation._id in unreadMessages
                          ? colors.purple
                          : colors.gray,
                      fontWeight:
                        conversation._id in unreadMessages ? "500" : "400",
                    },
                  ]}
                >
                  {sinceNow(conversation.lastMessage?.updatedAt)}
                </Text>
                <Text>
                  {conversation._id in unreadMessages &&
                    unreadMessages[conversation._id] > 0 && (
                      <View style={conversationStyles.unreadBadge}>
                        <Text style={conversationStyles.unreadBadgeText}>
                          {unreadMessages[conversation._id]}
                        </Text>
                      </View>
                    )}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
