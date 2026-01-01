export type PostType = {
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
