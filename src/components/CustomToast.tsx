import Feather from "@expo/vector-icons/Feather"
import { Image } from "expo-image"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { colors } from "@/src/utils/colors"
import useImageAspectRatio from "../utils/useImageAspectRatio"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function CustomToast({
  onPress,
  username,
  message,
  attachmentUrl,
  picture,
  iconName,
}: {
  onPress: () => void
  username: string
  message: string
  picture?: string
  attachmentUrl?: string
  iconName?: keyof typeof Feather.glyphMap
}) {
  const aspectRatio = useImageAspectRatio(attachmentUrl || "")

  return (
    <Pressable style={styles.customToast} onPress={onPress}>
      {iconName ? (
        <View style={styles.iconContainer}>
          <Feather name={iconName} size={20} color={colors.purple} />
        </View>
      ) : (
        <Image
          source={picture ? { uri: picture } : defaultProfilePicture}
          style={{ width: 40, height: 40, borderRadius: 20 }}
        />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.customTitle}>{username}</Text>
        <Text style={styles.customMessage}>{message}</Text>
        {attachmentUrl && (
          <Image
            source={{ uri: attachmentUrl }}
            style={[styles.messageAttachment, { aspectRatio }]}
            contentFit="cover"
          />
        )}
      </View>
      <Feather name="x" size={20} color={colors.darkGray} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  customToast: {
    width: "90%",
    backgroundColor: colors.light,
    borderRadius: 10,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.lightGray,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  customTitle: {
    color: colors.dark,
    fontWeight: "bold",
    fontSize: 16,
  },
  customMessage: {
    color: colors.dark,
    fontSize: 14,
    marginTop: 4,
  },
  messageAttachment: { width: 200, height: 150, borderRadius: 8 },
})
