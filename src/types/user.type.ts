import { MyPostType } from "./post.type";

export type UserType = null | {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  email: string;
  posts: MyPostType[];
  picture?: string | undefined;
  accessToken: string;
  refreshToken: string;
};
