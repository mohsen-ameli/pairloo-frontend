import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { memo, useEffect, useRef, useState } from "react";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useAtomValue, useSetAtom } from "jotai";
import { Image } from "expo-image";
import {
  conversationsAtom,
  messagesAtom,
  sendMessageAtom,
} from "@/src/utils/chat-store";
import { colors } from "@/src/utils/colors";
import {
  ConversationType,
  MessageType,
  OtherUser,
} from "@/src/types/chat.type";
import Feather from "@expo/vector-icons/Feather";
import CustomHeader from "@/src/components/CustomHeader";
import { formatDate } from "@/src/utils/format-date";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import useGradualAnimation from "@/src/utils/gradual-animation";
import { userAtom } from "@/src/utils/store";
// @ts-ignore
import defaultProfilePicture from "@/assets/images/default_pfp.png";
import { chatStyles } from "@/src/styles/chat.styles";
import { chatSocketAtom } from "@/src/utils/socket-store";

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const socket = useAtomValue(chatSocketAtom);
  const [message, setMessage] = useState<string>("");
  const messages = useAtomValue(messagesAtom);
  const sendMessage = useSetAtom(sendMessageAtom);
  const user = useAtomValue(userAtom);
  const conversations = useAtomValue(conversationsAtom);
  const [conversation, setConversation] = useState<ConversationType | null>(
    null
  );
  const chatRef = useRef<FlatList>(null!);
  const { height } = useGradualAnimation();
  const [otherUser, setOtherUser] = useState<OtherUser>(null!);

  useEffect(() => {
    if (!conversations || !user || !socket) return;

    // Find the current conversation
    const conv = conversations.find((conv) => conv._id === id);
    if (!conv) return;

    setConversation(conv);
    setOtherUser(conv.members.find((member) => member._id !== user._id)!);
    socket.emit("getMessages", id);
  }, [conversations, user, socket, id]);

  async function handleSendMessage() {
    const msg = message.trim();
    if (!msg) return;
    setMessage("");
    await sendMessage(id, msg);
  }

  // Animate fake view height
  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    };
  }, []);

  if (!conversation || !otherUser) {
    return (
      <View style={chatStyles.notFoundContainer}>
        <Text>Conversation not found</Text>
      </View>
    );
  }

  return (
    <View style={chatStyles.container}>
      <CustomHeader otherUser={otherUser} />

      <FlatList
        data={messages}
        ref={chatRef}
        onContentSizeChange={() =>
          chatRef.current.scrollToEnd({ animated: false })
        }
        keyboardDismissMode="on-drag"
        onLayout={() => chatRef.current.scrollToEnd({ animated: false })}
        keyExtractor={(item: MessageType) => item._id}
        renderItem={({ item }: { item: MessageType }) => (
          <MemoizedMessageItem item={item} />
        )}
      />

      <View style={chatStyles.inputContainer}>
        <TextInput
          style={chatStyles.input}
          placeholder="Type a message..."
          value={message}
          onChangeText={(text) => setMessage(text)}
        />
        <Pressable
          style={[
            chatStyles.sendButton,
            { display: message.trim() ? "flex" : "none" },
          ]}
          onPress={handleSendMessage}
        >
          <Feather name="send" size={22} color={colors.lightGray} />
        </Pressable>
      </View>

      <Animated.View style={[fakeView, { backgroundColor: colors.light }]} />
    </View>
  );
}

function MessageItem({ item }: { item: MessageType }) {
  return (
    <View style={chatStyles.messageItem}>
      <Image
        source={
          item.sender.picture
            ? { uri: item.sender.picture }
            : defaultProfilePicture
        }
        style={chatStyles.messageImage}
      />
      <View>
        <View style={chatStyles.messageHeader}>
          <Text style={chatStyles.messageUsername}>{item.sender.username}</Text>
          <Text style={chatStyles.messageDate}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
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
      </View>
    </View>
  );
}

const MemoizedMessageItem = memo(MessageItem);
