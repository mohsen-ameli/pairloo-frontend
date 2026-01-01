import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { styles } from "../styles/header.styles";
import { Image } from "expo-image";
// @ts-ignore
import defaultProfilePicture from "@/assets/images/default_pfp.png";
import { userAtom } from "../utils/store";
import { useAtomValue } from "jotai";

export default function CustomHeader({ title }: { title: string }) {
  const user = useAtomValue(userAtom)!;

  function handleProfilePress() {}

  return (
    <Stack.Screen
      options={{
        headerTitle: () => (
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{title}</Text>
            </View>
            <TouchableOpacity
              onPress={handleProfilePress}
              style={styles.profileButton}
            >
              <Image
                source={
                  user.picture ? { uri: user.picture } : defaultProfilePicture
                }
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>
        ),
      }}
    />
  );
}
