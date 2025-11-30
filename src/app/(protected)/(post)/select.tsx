import CustomLink from "@/src/components/CustomLink";
import { View } from "react-native";

export default function Select() {
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
      <CustomLink
        color="purple"
        text="I need ..."
        href={{
          pathname: "/category",
          params: { action: "need" },
        }}
      />
      <CustomLink
        color="green"
        text="I provide ..."
        href={{
          pathname: "/category",
          params: { action: "provide" },
        }}
      />
    </View>
  );
}
