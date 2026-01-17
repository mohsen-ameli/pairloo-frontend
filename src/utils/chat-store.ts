import { atom } from "jotai";
import { userAtom } from "./store";
import { WS_BASE_URL } from "./constants";
import io from "socket.io-client";
import { refreshAccessToken } from "./refresh-access-token";
import { ConversationType, MessageType } from "../types/chat.type";
import { chatSocketAtom } from "./socket-store";

export const conversationsAtom = atom<ConversationType[]>([]);

export const messagesAtom = atom<MessageType[]>([]);

// To prevent multiple initializations
const initializedAtom = atom(false);

export const initChatAtom = atom(null, async (get, set) => {
  const user = await get(userAtom);
  if (!user) return;
  const initialized = get(initializedAtom);
  if (initialized) return;
  set(initializedAtom, true);

  const socket = io(WS_BASE_URL + "/chat", {
    auth: {
      token: user.accessToken,
    },
  });

  set(chatSocketAtom, socket);

  socket.once("connected", () => {
    console.log("Connected to WebSocket server for chatting");
    socket.emit("getConversations");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server for chatting");
    set(chatSocketAtom, null);
    set(conversationsAtom, []);
    set(messagesAtom, []);
    set(initializedAtom, false);
  });

  socket.on("error", (err: any) => {
    console.error("WebSocket error event:", err);
  });

  socket.on("connect_error", async () => {
    const accessToken = await refreshAccessToken(user.refreshToken);
    if (accessToken === null) {
      socket.disconnect();
      set(userAtom, null);
      return;
    }
    await set(userAtom, { ...user, accessToken });
    socket.io.opts.auth = { token: accessToken };
    socket.connect();
  });

  // New conversation created
  socket.on("conversation", (conversation: ConversationType) => {
    set(conversationsAtom, (prev) => [...prev, conversation]);
  });

  // Got all conversations
  socket.on("conversations", (conversations: ConversationType[]) => {
    set(conversationsAtom, conversations);
  });

  socket.on(
    "lastMessageUpdated",
    (conversationId: string, lastMessage: MessageType) => {
      set(conversationsAtom, (prev) =>
        prev.map((conv) => {
          if (conv._id === conversationId) {
            return { ...conv, lastMessage };
          }
          return conv;
        })
      );
    }
  );

  // Got all messages for a conversation
  socket.on("messages", (messages: MessageType[]) => {
    set(messagesAtom, messages);
  });

  // Received a message from the server
  socket.on("message", (message: MessageType) => {
    let isOptimistic = false;
    set(messagesAtom, (prev) =>
      prev.map((msg) => {
        // This is our optimistic message, replace it
        if (msg.optimistic && msg.content === message.content) {
          isOptimistic = true;
          return message;
        }
        return msg;
      })
    );
    // we received a message from other user
    if (!isOptimistic) set(messagesAtom, (prev) => [...prev, message]);
  });
});

// Sends a message in a conversation
export const sendMessageAtom = atom(
  null,
  async (get, set, conversationId: string, content: string) => {
    const socket = get(chatSocketAtom);
    const user = await get(userAtom);
    if (!socket || !user) return;

    const optimisticMessage: MessageType = {
      _id: Math.random().toString(),
      conversationId,
      optimistic: true,
      sender: {
        _id: Math.random().toString(),
        username: user.username,
        picture: user.picture,
      },
      content,
      attachment: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Optimistically add the message to the list
    set(messagesAtom, (prev) => [...prev, optimisticMessage]);

    socket.emit("newMessage", {
      conversationId,
      content,
    });
  }
);
