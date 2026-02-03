import {
  ImageSourcePropType,
  type ImageStyle,
  Pressable,
  type StyleProp,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native"
import type { AnimatedProps } from "react-native-reanimated"
import Animated from "react-native-reanimated"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { useAtom } from "jotai"
import { settingsAtom } from "../store/create-post-store"

interface Props extends AnimatedProps<ViewProps> {
  style?: StyleProp<ImageStyle>
  index: number
  editable?: boolean
  source: ImageSourcePropType
  setImages?: React.Dispatch<React.SetStateAction<string[]>>
}

export function SlideItem({ style, index, source, editable = false, ...animatedViewProps }: Props) {
  const [settings, setSettings] = useAtom(settingsAtom)

  return (
    <Animated.View {...animatedViewProps}>
      <Animated.Image style={[style, styles.container]} source={source} />
      {editable && (
        <View style={styles.removeOverlay}>
          <Pressable
            style={styles.removeOverlayButton}
            onPress={() => {
              setSettings({
                ...settings,
                images: settings.images.filter((_, i) => i !== index),
              })
            }}
          >
            <Feather name="x" size={24} color={colors.dark} />
          </Pressable>
        </View>
      )}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 250,
    borderRadius: 15,
    backgroundColor: colors.lightGray,
  },
  removeOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  removeOverlayButton: {
    backgroundColor: colors.light,
    borderRadius: 20,
    padding: 5,
  },
  colorFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray,
  },
})
