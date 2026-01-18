import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { styles } from "../styles/header.styles";
import { Image } from "expo-image";
// @ts-ignore
import defaultProfilePicture from "@/assets/images/default_pfp.png";
import { userAtom } from "../store/auth-store";
import { useAtomValue } from "jotai";
import { OtherUser } from "../types/chat.type";
import { colors } from "../utils/colors";

export default function CustomHeader({
  title,
  otherUser,
}: {
  title?: string;
  otherUser?: OtherUser;
}) {
  const user = useAtomValue(userAtom)!;

  function handleProfilePress() {}

  if (otherUser) {
    return (
      <Stack.Screen
        options={{
          title,
          headerStyle: {
            backgroundColor: colors.lightBackground,
          },
          headerTitle: () => (
            <View style={styles.otherHeader}>
              <TouchableOpacity
                onPress={handleProfilePress}
                style={styles.otherProfileButton}
              >
                <Image
                  source={
                    otherUser.picture
                      ? { uri: otherUser.picture }
                      : defaultProfilePicture
                  }
                  style={styles.otherProfileImage}
                />
              </TouchableOpacity>
              <Text style={styles.otherHeaderTitle}>{otherUser.username}</Text>
            </View>
          ),
        }}
      />
    );
  }

  return (
    <Stack.Screen
      options={{
        title,
        headerStyle: {
          backgroundColor: colors.lightBackground,
        },
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
