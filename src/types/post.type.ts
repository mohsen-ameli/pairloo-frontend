export type PostType = {
  _id: string;
  type: "need" | "provide";
  userId: string;
  image?: string;
  name?: string;
  category?: string;
  quantity?: string;
  price?: string;
  region?: string;
  closestProducts?: string[];
};
