import { View, Text, TouchableOpacity, Pressable } from "react-native"
import React from "react"
import { styles } from "@/src/styles/header.styles"
import { Image } from "expo-image"
import { OtherUser } from "@/src/types/chat.type"
import { colors } from "@/src/utils/colors"
import { ExtendedStackNavigationOptions } from "expo-router/build/layouts/StackClient"
import Feather from "@expo/vector-icons/Feather"
import { useRouter } from "expo-router"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

// OtherUser is only passed when viewing another user's profile or chat
export default function useCustomHeader(
  title?: string,
  otherUser?: OtherUser,
  backButtonVisible: boolean = true
): ExtendedStackNavigationOptions {
  const router = useRouter()

  function handleProfilePress() {}

  let options: ExtendedStackNavigationOptions = {
    title,
    headerShown: true,
    headerBackVisible: false,
    headerBackButtonMenuEnabled: false,
    headerTintColor: colors.dark,
    headerBackButtonDisplayMode: "default",
    headerBackground() {
      return <View style={styles.headerBackground} />
    },
    headerTitle: () => (
      <View style={styles.header}>
        {backButtonVisible && (
          <Pressable
            style={styles.headerBackIcon}
            onPress={() => {
              router.back()
            }}
          >
            <Feather name="arrow-left" size={26} color={colors.dark} />
          </Pressable>
        )}
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
    ),
  }

  if (otherUser) {
    options = {
      ...options,
      headerTitle: () => (
        <View style={styles.otherHeader}>
          {backButtonVisible && (
            <Pressable
              style={styles.headerBackIcon}
              onPress={() => {
                router.back()
              }}
            >
              <Feather name="arrow-left" size={26} color={colors.dark} />
            </Pressable>
          )}
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
