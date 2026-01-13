import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { Image } from "expo-image";
import {
  chatSocketAtom,
  conversationsAtom,
  messagesAtom,
  sendMessageAtom,
} from "@/src/utils/chat-store";
import { colors } from "@/src/utils/colors";
import { MessageType, OtherUser } from "@/src/types/chat.type";
import Feather from "@expo/vector-icons/Feather";
import CustomHeader from "@/src/components/CustomHeader";
import { formatDate } from "@/src/utils/format-date";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import useGradualAnimation from "@/src/utils/gradual-animation";
import { userAtom } from "@/src/utils/store";
// @ts-ignore
import defaultProfilePicture from "@/assets/images/default_pfp.png";

const ITEM_HEIGHT = 80;

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const socket = useAtomValue(chatSocketAtom);
  const [message, setMessage] = useState<string>("");
  const messages = useAtomValue(messagesAtom);
  const sendMessage = useSetAtom(sendMessageAtom);
  const user = useAtomValue(userAtom);
  const conversation = useAtomValue(conversationsAtom).filter(
    (conv) => conv._id === id
  )[0];
  const chatRef = useRef<FlatList>(null!);
  const { height } = useGradualAnimation();
  const [otherUser, setOtherUser] = useState<OtherUser>(null!);

  useEffect(() => {
    if (!conversation || !user) return;
    setOtherUser(
      conversation.members.find((member) => member._id !== user.id)!
    );
  }, [conversation, user]);

  useEffect(() => {
    socket?.emit("getMessages", { conversationId: id });
  }, [socket, id]);

  async function handleSendMessage() {
    setMessage("");
    await sendMessage(id, message);
  }

  // Animate fake view height
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  if (!conversation || !otherUser) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Conversation not found</Text>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, gap: 10, backgroundColor: colors.light, padding: 10 }}
    >
      <CustomHeader otherUser={otherUser} />

      <FlatList
        data={messages}
        ref={chatRef}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        onContentSizeChange={() =>
          chatRef.current.scrollToEnd({ animated: false })
        }
        keyboardDismissMode="on-drag"
        onLayout={() => chatRef.current.scrollToEnd({ animated: false })}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageItem item={item} />}
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <TextInput
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: colors.gray,
            borderRadius: 5,
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
          placeholder="Type a message..."
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <Pressable
          style={{
            position: "absolute",
            right: 10,
            padding: 10,
            display: message.trim() ? "flex" : "none",
          }}
          onPress={handleSendMessage}
        >
          <Feather name="send" size={26} color={colors.purple} />
        </Pressable>
      </View>

      <Animated.View style={[fakeView, { backgroundColor: colors.light }]} />
    </View>
  );
}

function MessageItem({ item }: { item: MessageType }) {
  return (
    <View style={{ marginVertical: 10 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Image
          source={
            item.sender.picture
              ? { uri: item.sender.picture }
              : defaultProfilePicture
          }
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{item.sender.username}</Text>
            <Text style={{ fontSize: 10, color: colors.gray }}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              color: item.optimistic ? colors.gray : colors.dark,
            }}
          >
            {item.content}
          </Text>
        </View>
      </View>
    </View>
  );
}
