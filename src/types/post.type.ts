export type PostType = {
  _id: string;
  type: "need" | "provide";
  userId: string;
  image?: string;
  productName: string;
  name?: string; // for legacy or future compatibility
  category?: string;
  quantity?: string;
  price?: string;
  region?: string;
  closestProducts?: string[];
};
