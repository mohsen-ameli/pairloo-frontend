import { atom } from "jotai";
import { logOutAtom, userAtom } from "./store";
import { WS_BASE_URL } from "./constants";
import io from "socket.io-client";
import { refreshAccessToken } from "./refresh-access-token";
import { ConversationType, MessageType } from "../types/chat.type";

export const chatSocketAtom = atom<SocketIOClient.Socket | null>(null);

export const conversationsAtom = atom<ConversationType[]>([]);

export const messagesAtom = atom<MessageType[]>([]);

export const initChatAtom = atom(null, async (get, set) => {
  const user = await get(userAtom);
  if (!user) return;

  const socket = io(WS_BASE_URL + "/chat", {
    auth: {
      token: user.accessToken,
    },
  });

  set(chatSocketAtom, socket);

  socket.on("connected", () => {
    console.log("Connected to WebSocket server for chatting");
    socket.emit("getConversations");
  });

  socket.on("error", (err: any) => {
    console.error("WebSocket error event:", err);
  });

  socket.on("connect_error", async () => {
    const accessToken = await refreshAccessToken(user.refreshToken);
    if (accessToken === null) {
      socket.disconnect();
      set(logOutAtom);
      return;
    }
    await set(userAtom, { ...user, accessToken });
    socket.io.opts.auth = { token: accessToken };
    socket.connect();
    socket.once("connected", () => {
      socket.emit("getConversations");
    });
  });

  // Got all conversations
  socket.on("conversations", (conversations: ConversationType[]) => {
    set(conversationsAtom, conversations);
  });

  // Got all messages for a conversation
  socket.on("messages", (messages: MessageType[]) => {
    set(messagesAtom, messages);
  });

  // Received a message from the server
  socket.on("message", (message: MessageType) => {
    set(messagesAtom, (prev) =>
      prev.map((msg) => {
        if (msg.optimistic && msg.content === message.content) {
          return message;
        }
        return msg;
      })
    );
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
      id: Math.random().toString(),
      conversationId,
      optimistic: true,
      sender: {
        id: Math.random().toString(),
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
