import { MyPostType } from "./post.type";

export type UserType = null | {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  email: string;
  posts: MyPostType[];
  picture?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  accessToken: string;
  refreshToken: string;
};
