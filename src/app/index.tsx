import { VideoView, useVideoPlayer } from "expo-video"
import CustomLink from "@/src/components/CustomLink"
import { colors, isWeb } from "@/src/utils/colors"
import { Link, useFocusEffect } from "expo-router"
import { Appearance, Platform, Text, View } from "react-native"
import { useEffect, useState, useCallback } from "react"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import ContinueWithGoogle from "./(auth)/continue-with-google"
import { commonStyles } from "../styles/common.styles"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

const ANIMATION_DELAY = 1000

const colorScheme = Appearance.getColorScheme()

const videoSource = Platform.select({
  native:
    colorScheme === "dark"
      ? require("@/assets/videos/animation-portrait-dark.mp4")
      : require("@/assets/videos/animation-portrait-light.mp4"),
  web: isWeb
    ? colorScheme === "dark"
      ? require("@/assets/videos/animation-landscape-dark.mp4")
      : require("@/assets/videos/animation-landscape-light.mp4")
    : colorScheme === "dark"
      ? require("@/assets/videos/animation-portrait-dark.mp4")
      : require("@/assets/videos/animation-portrait-light.mp4"),
})

export default function Landing() {
  const [loading, setLoading] = useState(false)

  const slideAnim = useSharedValue(40)
  const fadeAnim = useSharedValue(0)

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true
    player.muted = true
    player.play()
  })

  useEffect(() => {
    if (player.status === "idle" && !player.playing) {
      player.play()
    }
  }, [player])

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideAnim.value) }],
    opacity: fadeAnim.value,
  }))

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        slideAnim.value = 0
        fadeAnim.value = withSpring(1, { stiffness: 80, damping: 10, mass: 1 })
      }, ANIMATION_DELAY)
    }, [])
  )

  return (
    <>
      <LoadingIndicator loading={loading} opacity={0.5} />

      <VideoView
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          alignSelf: "center",
          top: 0,
          zIndex: -1,
        }}
        contentFit={isWeb ? "cover" : "contain"}
        player={player}
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
      />

      <Animated.View
        style={[
          commonStyles.generalContainer,
          {
            backgroundColor: "transparent",
          },
          animatedStyles,
        ]}
      >
        <View
          style={[
            commonStyles.container,
            {
              flex: 1,
              backgroundColor: "transparent",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingTop: 120,
              padding: 20,
            },
          ]}
        >
          <View style={{ width: "100%", gap: 20 }}>
            <CustomLink href="/register">Create account</CustomLink>
            <Link href="/login" style={{ alignSelf: "center" }}>
              <Text
                style={{
                  color: colors.purple,
                  textAlign: "center",
                  fontSize: 20,
                }}
              >
                Log in
              </Text>
            </Link>
            <ContinueWithGoogle setLoading={setLoading} />
          </View>
        </View>
      </Animated.View>
    </>
  )
}
