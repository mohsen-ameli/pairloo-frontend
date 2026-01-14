export type GeneralPostType = {
  _id: string; // userId of the poster
  username: string;
  firstName: string;
  lastName: string;
  content: string;
  summary: string;
  picture: string;
  images?: string[] | null | undefined;
  createdAt: string;
};

export interface ClosestPostType extends GeneralPostType {
  item: string;
  score: string;
}

export interface MyPostType extends GeneralPostType {
  closestPosts?: ClosestPostType[];
}
