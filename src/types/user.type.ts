import { MyPostType } from "./post.type";

export type UserType = null | {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  timezone: string;
  locationId: number; // reference to Location _id
  email: string;
  posts: MyPostType[];
  picture?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  accessToken: string;
  refreshToken: string;
};
