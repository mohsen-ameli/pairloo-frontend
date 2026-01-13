export type MessageType = {
  id: string;
  conversationId: string;
  optimistic?: boolean;
  sender: {
    id: string;
    username: string;
    picture?: string;
  };
  content: string;
  attachment: string;
  createdAt: string;
  updatedAt: string;
};

export interface ConversationType {
  _id: string;
  members: {
    _id: string;
    username: string;
    picture?: string;
    email: string;
  }[];
  lastMessage?: MessageType;
}

export type OtherUser = {
  _id: string;
  username: string;
  picture?: string | undefined;
  email: string;
};
