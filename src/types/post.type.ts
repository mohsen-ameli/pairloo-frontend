export type GeneralPostType = {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  content: string;
  summary: string;
  picture: string;
  images?: string[] | null | undefined;
  createdAt: string;
};

export type ClosestPostType = GeneralPostType & { item: string; score: string };

export type MyPostType = GeneralPostType & {
  closestPosts?: ClosestPostType[];
};
