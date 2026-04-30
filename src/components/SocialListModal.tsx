import { ProfileSocialUserType } from "@/src/types/user.type"
import { colors } from "@/src/utils/colors"
import Feather from "@expo/vector-icons/Feather"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { FlatList, Modal, Pressable, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { profileStyles } from "@/src/styles/profile.styles"

type SocialListModalProps = {
  visible: boolean
  title: string
  users: ProfileSocialUserType[]
  emptyText: string
  onClose: () => void
}

export default function SocialListModal({
  visible,
  title,
  users,
  emptyText,
  onClose,
}: SocialListModalProps) {
  const router = useRouter()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={profileStyles.socialModalContainer}>
        <View style={profileStyles.socialModalHeader}>
          <Text style={profileStyles.socialModalTitle} numberOfLines={1}>
            {title}
          </Text>
          <Pressable onPress={onClose} style={profileStyles.socialModalCloseButton}>
            <Feather name="x" size={20} color={colors.dark} />
          </Pressable>
        </View>

        <FlatList
          data={users}
          keyExtractor={item => item._id}
          contentContainerStyle={profileStyles.socialListContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={profileStyles.emptyStateContainer}>
              <Text style={profileStyles.emptyStateText}>{emptyText}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "(details)/profile",
                  params: { id: item._id },
                })
              }
              style={profileStyles.socialRow}
            >
              <Image
                source={
                  item.picture ? { uri: item.picture } : require("@/assets/images/default_pfp.png")
                }
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
      </SafeAreaView>
    </Modal>
  )
}
