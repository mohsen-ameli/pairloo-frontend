import { View, Text } from "react-native";
import React from "react";
import CustomHeader from "@/src/components/CustomHeader";

export default function Index() {
  return (
    <View>
      <CustomHeader title="Create Post" />
      <Text>New post</Text>
    </View>
  );
}
