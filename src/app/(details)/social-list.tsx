import React, { useState, useEffect, useRef } from "react"
import { View, Text, Pressable, ActivityIndicator, Animated } from "react-native"
import { Stack, useLocalSearchParams, useRouter } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import { useSetAtom } from "jotai"
import { FlashList } from "@shopify/flash-list"
import { authFetchAtom } from "@/src/store/auth-store"
import { UserSocialType } from "@/src/types/user.type"
import { profileStyles } from "@/src/styles/profile.styles"
import { colors } from "@/src/utils/colors"
import { Image } from "expo-image"
import useCustomHeader from "@/src/utils/useCustomHeader"
import { commonStyles } from "@/src/styles/common.styles"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function SocialListPage() {
  const { type, id, username } = useLocalSearchParams<{
    type: "followers" | "following"
    id: string
    username: string
  }>()
  const router = useRouter()
  const authFetch = useSetAtom(authFetchAtom)
  const [active, setActive] = useState(type)
  const [containerWidth, setContainerWidth] = useState(0)
  const [slideAnim] = useState(new Animated.Value(0))
  const hasInitializedSlider = useRef(false)
  const socialListOptions = useCustomHeader({ title: `@${username}` })

  useEffect(() => {
    if (containerWidth > 0) {
      const targetPosition = active === "followers" ? 0 : containerWidth / 2

      if (!hasInitializedSlider.current) {
        slideAnim.setValue(targetPosition)
        hasInitializedSlider.current = true
        return
      }

      Animated.timing(slideAnim, {
        toValue: targetPosition,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [active, containerWidth, slideAnim])

  async function fetchSocial() {
    const res = await authFetch(`/api/users/social/${id}`)
    const data: UserSocialType = await res.json()
    return data
  }

  const { data, isPending, isError } = useQuery({
    queryKey: ["user-social", id],
    queryFn: fetchSocial,
  })

  if (isPending) {
    return (
      <View style={commonStyles.generalContainer}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    )
  }

  if (isError || !data) {
    return (
      <View style={commonStyles.generalContainer}>
        <Text style={{ color: colors.dark }}>Error loading list.</Text>
        <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
          <Text style={{ color: colors.purple }}>Go back</Text>
        </Pressable>
      </View>
    )
  }

  const list = active === "followers" ? data.followers : data.following

  return (
    <>
      <Stack.Screen options={socialListOptions} />

      <View style={commonStyles.generalContainer}>
        <View style={commonStyles.container}>
          <View
            style={profileStyles.actionContainer}
            onLayout={event => setContainerWidth(event.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[
                profileStyles.actionTabAnimation,
                { width: "50%", transform: [{ translateX: slideAnim }] },
              ]}
            />
            <Pressable style={profileStyles.profileTab} onPress={() => setActive("followers")}>
              <Text
                style={
                  active === "followers" ? profileStyles.activeTab : profileStyles.nonActiveTab
                }
              >
                Followers
              </Text>
            </Pressable>

            <Pressable style={profileStyles.profileTab} onPress={() => setActive("following")}>
              <Text
                style={
                  active === "following" ? profileStyles.activeTab : profileStyles.nonActiveTab
                }
              >
                Following
              </Text>
            </Pressable>
          </View>

          <FlashList
            data={list}
            keyExtractor={item => item._id}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={profileStyles.emptyStateContainer}>
                <Text style={profileStyles.emptyStateText}>
                  {active === "followers" ? "No followers yet." : "Not following anyone yet."}
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "(details)/general-profile",
                    params: { id: item._id },
                  })
                }
                style={profileStyles.socialRow}
              >
                <Image
                  source={item.picture ? { uri: item.picture } : defaultProfilePicture}
                  style={profileStyles.socialAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={profileStyles.socialName} numberOfLines={1}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Text style={profileStyles.socialUsername} numberOfLines={1}>
                    @{item.username}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </View>
    </>
  )
}
