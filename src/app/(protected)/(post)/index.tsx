import CustomButton from "@/src/components/CustomButton";
import CustomLink from "@/src/components/CustomLink";
import { colors } from "@/src/utils/colors";
import { logOutAtom, userAtom } from "@/src/utils/store";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useAtomValue, useSetAtom } from "jotai";
import { ScrollView, Text, View } from "react-native";

const posts = [
  {
    title: "Micka for sale",
    category: "pet",
    price: "$200",
    image: "https://images.dog.ceo/breeds/poodle-standard/n02113799_1922.jpg",
  },
  {
    title: "iPhone 12 Pro",
    category: "product",
    price: "$600",
    image:
      "https://i.insider.com/5fad82d9343ad40018a93811?width=800&format=jpeg&auto=webp",
  },
];

export default function index() {
  const user = useAtomValue(userAtom);
  const logout = useSetAtom(logOutAtom);
  const router = useRouter();

  return (
    <ScrollView
      contentContainerStyle={{
        flex: 1,
        alignItems: "center",
        gap: 10,
        margin: 20,
      }}
    >
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
        }}
      >
        Welcome, {user.username}
      </Text>

      <CustomButton text="Logout" onPress={logout} />
      <CustomLink text="Create new post" href="/select" />

      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 20,
        }}
      >
        Your Posts
      </Text>
      {posts.map((post, index) => (
        <View
          key={index}
          style={{
            width: "100%",
            height: 100,
            backgroundColor: "rgba(193, 253, 255, 1)",
            borderRadius: 10,
            padding: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 10,
              backgroundColor: colors.borderGray,
              overflow: "hidden",
            }}
          >
            <Image
              source={post.image}
              style={{
                width: "100%",
                height: "100%",
              }}
              contentFit="cover"
            />
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {post.title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#666",
              }}
            >
              {post.category}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {post.price}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
