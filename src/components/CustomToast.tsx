import Feather from "@expo/vector-icons/Feather"
import { Image } from "expo-image"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { colors } from "@/src/utils/colors"

export default function CustomToast({
  onPress,
  username,
  message,
  picture,
}: {
  onPress: () => void
  username: string
  message: string
  picture?: string
}) {
  return (
    <Pressable style={styles.customToast} onPress={onPress}>
      {picture ? (
        <Image source={{ uri: picture }} style={{ width: 40, height: 40, borderRadius: 20 }} />
      ) : (
        <Feather name="user" size={40} color={colors.light} />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.customTitle}>{username}</Text>
        <Text style={styles.customMessage}>{message}</Text>
      </View>
      <Feather name="x" size={20} color={colors.light} />
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
})
