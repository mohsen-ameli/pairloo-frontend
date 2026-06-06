import { VideoView, useVideoPlayer } from "expo-video"
import CustomLink from "@/src/components/CustomLink"
import { colors, isDesktop } from "@/src/utils/colors"
import { Link, useFocusEffect } from "expo-router"
import { Appearance, AppState, Platform, Text, View } from "react-native"
import { useEffect, useState, useCallback } from "react"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import ContinueWithGoogle from "./(auth)/continue-with-google"
import { commonStyles } from "@/src/styles/common.styles"
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated"

const ANIMATION_DELAY = 1500

const colorScheme = Appearance.getColorScheme()

let videoSource: any = null
let contentFit: "cover" | "contain" = "contain"
let mobile = false

if (Platform.OS === "web") {
  if (isDesktop) {
    if (colorScheme === "dark") {
      videoSource = require("@/assets/videos/animation-landscape-dark.mp4")
    } else {
      videoSource = require("@/assets/videos/animation-landscape-light.mp4")
    }
  } else {
    contentFit = "cover"
    mobile = true
    if (colorScheme === "dark") {
      videoSource = require("@/assets/videos/animation-portrait-dark.mp4")
    } else {
      videoSource = require("@/assets/videos/animation-portrait-light.mp4")
    }
  }
} else {
  mobile = true
  if (colorScheme === "dark") {
    videoSource = require("@/assets/videos/animation-portrait-dark.mp4")
  } else {
    videoSource = require("@/assets/videos/animation-portrait-light.mp4")
  }
}

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

  useEffect(
    AppState.addEventListener("change", nextAppState => {
      switch (nextAppState) {
        case "active":
          player.play()
          break
        default:
          break
      }
    }).remove,
    []
  )

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(slideAnim.value) }],
    opacity: fadeAnim.value,
  }))

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        slideAnim.value = 0
        fadeAnim.value = withSpring(1, { stiffness: 80, damping: 10, mass: 1 })
      }, ANIMATION_DELAY)

      return () => {
        clearTimeout(timeout)
      }
    }, [])
  )

  return (
    <>
      <LoadingIndicator loading={loading} opacity={0.5} />

      <VideoView
        style={{
          width: mobile ? "100%" : "auto",
          height: "100%",
          position: "absolute",
          alignSelf: "center",
          top: 0,
          zIndex: -1,
        }}
        player={player}
        playsInline
        nativeControls={false}
        fullscreenOptions={{ enable: false }}
        allowsPictureInPicture={false}
        contentFit={contentFit}
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
