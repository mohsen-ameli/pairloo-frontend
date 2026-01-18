import { View, ActivityIndicator } from "react-native";
import React from "react";
import { colors } from "@/src/utils/colors";

export default function LoadingIndicator({ loading }: { loading: boolean }) {
  if (!loading) return null;
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: colors.lightGray,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      <ActivityIndicator size="large" color={colors.blue} />
    </View>
  );
}
