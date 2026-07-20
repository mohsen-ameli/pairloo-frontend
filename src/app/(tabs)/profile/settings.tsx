import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import { userAtom, logOutAtom } from "@/src/store/auth-store"
import { styles } from "@/src/styles/settings.styles"
import CustomButton from "@/src/components/CustomButton"
import CustomInput from "@/src/components/CustomInput"
import LocationSelector from "@/src/components/LocationSelector"
import { colors } from "@/src/utils/colors"
import { useEffect } from "react"
import Feather from "@expo/vector-icons/Feather"
import { useRouter } from "expo-router"
import {
  editFieldsAtom,
  editModeAtom,
  handleSaveEditAtom,
  loadingAtom,
  resetEditAtom,
} from "@/src/store/settings-store"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { commonStyles } from "@/src/styles/common.styles"
import CustomCompactButton from "@/src/components/CustomCompactButton"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function SettingsScreen() {
  const router = useRouter()
  const logout = useSetAtom(logOutAtom)
  const user = useAtomValue(userAtom)
  const loading = useAtomValue(loadingAtom)
  const [editMode, setEditMode] = useAtom(editModeAtom)
  const [editFields, setEditFields] = useAtom(editFieldsAtom)
  const resetEdit = useSetAtom(resetEditAtom)
  const handleSaveEdit = useSetAtom(handleSaveEditAtom)

  useEffect(() => {
    if (!user) return
    resetEdit()
  }, [user])

  if (!user) return null

  return (
    <>
      <LoadingIndicator loading={loading} opacity={0.75} />

      <View style={commonStyles.generalContainer}>
        <ScrollView
          contentContainerStyle={commonStyles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Account */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <Pressable
                  onPress={() => {
                    if (!editMode) return
                    router.push({
                      pathname: "/attachment-picker",
                      params: { intent: "pfp" },
                    })
                  }}
                  style={styles.avatarContainer}
                >
                  <Image
                    source={
                      editFields.picture ? { uri: editFields.picture } : defaultProfilePicture
                    }
                    style={styles.avatar}
                    contentFit="cover"
                  />
                  {editMode && (
                    <View
                      style={[
                        styles.avatar,
                        {
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          backgroundColor: "#c6c6c677",
                          justifyContent: "center",
                          alignItems: "center",
                        },
                      ]}
                    >
                      <Feather name="edit-2" size={18} color={colors.dark} />
                    </View>
                  )}
                </Pressable>
                <View style={styles.profileTextContainer}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text style={styles.profileName}>
                      {user.firstName} {user.lastName}
                    </Text>
                    {!editMode && (
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          paddingLeft: 12,
                          paddingVertical: 2,
                        }}
                        onPress={() => setEditMode(true)}
                        accessibilityLabel="Edit profile"
                      >
                        <Feather name="edit-2" size={18} color={colors.purple} />
                        <Text
                          style={{
                            color: colors.purple,
                            fontWeight: "600",
                            marginLeft: 4,
                            fontSize: 15,
                          }}
                        >
                          Edit
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.profileUsername} numberOfLines={1}>
                    @{user.username}
                  </Text>
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Email</Text>
                <Text style={styles.fieldValue}>{user.email}</Text>
              </View>
              {editMode ? (
                <View style={styles.editableContainer}>
                  <CustomInput
                    title="First Name"
                    defaultValue={editFields.firstName}
                    onChangeText={(text: string) => {
                      setEditFields(f => ({ ...f, firstName: text }))
                    }}
                  />
                  <CustomInput
                    title="Last Name"
                    defaultValue={editFields.lastName}
                    onChangeText={(text: string) => setEditFields(f => ({ ...f, lastName: text }))}
                  />
                  <LocationSelector
                    onLocationChange={location => {
                      setEditFields(f => ({
                        ...f,
                        city: location.name,
                        state: location.state_name,
                        country: location.country_name,
                        latitude: location.latitude,
                        longitude: location.longitude,
                        timezone: location.timezone,
                        locationId: location._id,
                      }))
                    }}
                  />
                  <View style={styles.actionsRow}>
                    <View style={{ flex: 1 }}>
                      <CustomButton onPress={handleSaveEdit} color={colors.purple} fontSize={16}>
                        Save Changes
                      </CustomButton>
                    </View>
                    <View style={{ width: 12 }} />
                    <View style={{ flex: 1 }}>
                      <CustomButton onPress={resetEdit} color={colors.muted} fontSize={16}>
                        Cancel
                      </CustomButton>
                    </View>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>First Name</Text>
                    <Text style={styles.fieldValue}>{user.firstName}</Text>
                  </View>
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Last Name</Text>
                    <Text style={styles.fieldValue}>{user.lastName}</Text>
                  </View>
                  {user.phoneNumber && (
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Phone</Text>
                      <Text style={styles.fieldValue}>{user.phoneNumber}</Text>
                    </View>
                  )}
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Location</Text>
                    <Text style={styles.fieldValue}>
                      {user.city} ({user.state}, {user.country})
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Other */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Other</Text>
            <View style={styles.card}>
              <View style={styles.fieldRow}>
                <CustomCompactButton
                  onPress={() => router.push("/privacy-policy")}
                  color={colors.dark}
                  outline
                  width="100%"
                >
                  <Feather
                    name="file-text"
                    size={18}
                    color={colors.dark}
                    style={{ marginRight: 6 }}
                  />
                  Privacy Policy
                </CustomCompactButton>
              </View>

              <View style={styles.fieldRow}>
                <CustomCompactButton
                  onPress={async () => await logout(true)}
                  color={colors.errorRed}
                  outline
                  width="100%"
                >
                  <Feather
                    name="log-out"
                    size={18}
                    color={colors.dark}
                    style={{ marginRight: 6 }}
                  />
                  Log Out
                </CustomCompactButton>
              </View>
              <View style={styles.fieldRow}>
                <CustomCompactButton
                  onPress={() => router.push("/delete-account")}
                  color={colors.errorRed}
                  width="100%"
                >
                  <Feather
                    name="trash-2"
                    size={18}
                    color={colors.dark}
                    style={{ marginRight: 6 }}
                  />
                  Delete Account
                </CustomCompactButton>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  )
}
