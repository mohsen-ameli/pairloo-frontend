export type MyPostType = {
  _id: string;
  userId: string;
  content: string;
  summary: string;
  images: string[];
  closestPosts?: {
    score: string;
    item: string;
  }[];
};

export type FeedPostType = {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  content: string;
  summary: string;
  images?: string[];
  picture: string;
};
