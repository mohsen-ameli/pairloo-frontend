import CustomButton from "@/src/components/CustomButton";
import CustomHeader from "@/src/components/CustomHeader";
import { chatSocketAtom, conversationsAtom } from "@/src/utils/chat-store";
import { colors } from "@/src/utils/colors";
import Feather from "@expo/vector-icons/Feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { Pressable, Text, View } from "react-native";

export default function index() {
  const router = useRouter();
  const conversations = useAtomValue(conversationsAtom);
  const socket = useAtomValue(chatSocketAtom);

  return (
    <View>
      <CustomHeader title="Chat" />

      {conversations.map((conversation) => (
        <Pressable
          key={conversation._id}
          style={{
            flexDirection: "row",
            alignItems: "center",
            margin: 10,
            gap: 10,
            shadowColor: colors.dark,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            backgroundColor: colors.light,
            padding: 10,
            borderRadius: 8,
          }}
          onPress={() => {
            router.push(`/chat/${conversation._id}`);
          }}
        >
          {conversation.members[1].picture && (
            <Image
              source={{ uri: conversation.members[1].picture }}
              style={{ width: 50, height: 50, borderRadius: 25 }}
            />
          )}
          <Text
            style={{
              fontSize: 16,
              fontWeight: "semibold",
            }}
          >
            {conversation.members[1].username}
          </Text>
          <Text>{conversation.lastMessage?.content}</Text>
          <Feather
            name="chevron-right"
            size={24}
            color={colors.dark}
            style={{
              marginLeft: "auto",
            }}
          />
        </Pressable>
      ))}
      <CustomButton
        onPress={() => {
          socket?.emit("getConversations");
        }}
      >
        Do something
      </CustomButton>
    </View>
  );
}
