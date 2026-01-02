export type MyPostType = {
  _id: string;
  userId: string;
  content: string;
  summary: string;
  image?: string;
  closestPosts?: {
    score: string;
    item: string;
  }[];
};

export type FeedPostType = {
  _id: string;
  userId: string;
  username: string;
  content: string;
  summary: string;
  image?: string;
  picture: string;
};
