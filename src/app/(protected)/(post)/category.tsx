import CustomLink from "@/src/components/CustomLink";
import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function Category() {
  const params = useLocalSearchParams<{ action?: string }>();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        margin: 20,
      }}
    >
      <Text style={{ fontSize: 20 }}>I {params.action} a ...</Text>
      <CustomLink
        text="Job"
        href={{
          pathname: "/job",
          params: { action: params.action, category: "job" },
        }}
      />
      {params.action == "need" && (
        <CustomLink
          text="Partner"
          href={{
            pathname: "/partner",
            params: { action: params.action, category: "partner" },
          }}
        />
      )}
      <CustomLink
        text="Product"
        href={{
          pathname: "/product",
          params: { action: params.action, category: "product" },
        }}
      />
      <CustomLink
        text="Pet"
        href={{
          pathname: "/pet",
          params: { action: params.action, category: "pet" },
        }}
      />
      <CustomLink
        text="Something else"
        href={{
          pathname: "/something",
          params: { action: params.action, category: "something" },
        }}
      />
    </View>
  );
}
