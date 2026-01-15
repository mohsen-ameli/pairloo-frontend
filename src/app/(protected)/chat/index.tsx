import CustomHeader from "@/src/components/CustomHeader";
import { conversationStyles } from "@/src/styles/conversation.style";
import { conversationsAtom } from "@/src/utils/chat-store";
import { sinceNow } from "@/src/utils/format-date";
import { formatString } from "@/src/utils/format-string";
import { userAtom } from "@/src/utils/store";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

export default function index() {
  const router = useRouter();
  const conversations = useAtomValue(conversationsAtom);
  const { redirect } = useLocalSearchParams();
  const user = useAtomValue(userAtom);

  useEffect(() => {
    if (redirect) {
      router.push(redirect as string);
      router.setParams({ redirect: undefined });
    }
  }, [redirect]);

  return (
    <>
      <CustomHeader title="Chat" />

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
                    {otherPerson._id === conversation.lastMessage?.sender?._id
                      ? "you"
                      : conversation.lastMessage?.sender?.username}
                    : {formatString(conversation.lastMessage?.content, 32)}
                  </Text>
                )}
              </View>
              <Text style={conversationStyles.timestamp}>
                {sinceNow(conversation.lastMessage?.updatedAt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </>
  );
}
