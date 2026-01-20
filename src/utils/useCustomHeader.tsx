import { View, Text, TouchableOpacity } from "react-native"
import React from "react"
import { styles } from "@/src/styles/header.styles"
import { Image } from "expo-image"
import { userAtom } from "@/src/store/auth-store"
import { useAtomValue } from "jotai"
import { OtherUser } from "@/src/types/chat.type"
import { colors } from "@/src/utils/colors"
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

// OtherUser is only passed when viewing another user's profile or chat
export default function useCustomHeader(
  title?: string,
  otherUser?: OtherUser
): ExtendedStackNavigationOptions {
  const user = useAtomValue(userAtom)

  function handleProfilePress() {}

  let options: ExtendedStackNavigationOptions = {
    title,
    headerShown: true,
    headerStyle: {
      backgroundColor: colors.lightBackground,
    },
    headerTintColor: colors.dark,
    headerBackButtonDisplayMode: "minimal",
    headerBackground() {
      return (
        <View
          style={{
            backgroundColor: colors.light,
            flex: 1,
            borderBottomColor: colors.gray,
            borderBottomWidth: 1,
          }}
        />
      )
    },
    headerTitle: () => (
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <TouchableOpacity onPress={handleProfilePress} style={styles.profileButton}>
          <Image
            source={user?.picture ? { uri: user.picture } : defaultProfilePicture}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>
    ),
  }

  if (otherUser) {
    options = {
      ...options,
      headerTitle: () => (
        <View style={styles.otherHeader}>
          <TouchableOpacity onPress={handleProfilePress} style={styles.otherProfileButton}>
            <Image
              source={otherUser.picture ? { uri: otherUser.picture } : defaultProfilePicture}
              style={styles.otherProfileImage}
            />
          </TouchableOpacity>
          <Text style={styles.otherHeaderTitle}>{otherUser.username}</Text>
        </View>
      ),
    }
  }

  return options
}
