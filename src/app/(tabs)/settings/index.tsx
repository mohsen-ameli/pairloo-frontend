import { useAtom, useSetAtom } from "jotai"
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import { userAtom, logOutAtom } from "@/src/store/auth-store"
import { styles } from "@/src/styles/settings.styles"
import CustomButton from "@/src/components/CustomButton"
import CustomInput from "@/src/components/CustomInput"
import LocationSelector from "@/src/components/LocationSelector"
import { colors } from "@/src/utils/colors"
import { useEffect, useState } from "react"
import { authFetchAtom } from "@/src/utils/auth-fetch"
import Feather from "@expo/vector-icons/Feather"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")

export default function SettingsScreen() {
  const logout = useSetAtom(logOutAtom)
  const [user, setUser] = useAtom(userAtom)
  const [editMode, setEditMode] = useState(false)
  const [editFields, setEditFields] = useState({
    firstName: "",
    lastName: "",
    country: "",
    city: "",
    state: "",
    latitude: 0,
    longitude: 0,
    timezone: "",
    locationId: 0,
  })
  const authFetch = useSetAtom(authFetchAtom)

  useEffect(() => {
    if (!user) return
    resetEdit()
  }, [user])

  async function handleSaveEdit() {
    if (!user) return
    try {
      const response = await authFetch("/api/settings/update-profile", {
        method: "PATCH",
        body: JSON.stringify(editFields),
      })
      if (!response.ok) {
        let errorMessage = "Failed to update profile"
        try {
          const errorData = await response.json()
          if (errorData && errorData.message) {
            errorMessage = errorData.message
          }
        } catch {}
        Alert.alert("Update Failed", errorMessage)
        return
      }
      const updatedUser = await response.json()
      setUser({ ...user, ...updatedUser })
      setEditMode(false)
      Alert.alert("Profile Updated", "Your changes have been saved.")
    } catch (err: any) {
      Alert.alert("Update Failed", err?.message || "An unexpected error occurred.")
    }
  }

  function resetEdit() {
    if (!user) return
    setEditFields({
      firstName: user.firstName,
      lastName: user.lastName,
      country: user.country,
      city: user.city,
      state: user.state,
      latitude: user.latitude,
      longitude: user.longitude,
      timezone: user.timezone,
      locationId: user.locationId,
    })
    setEditMode(false)
  }

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ])
  }

  if (!user || !editFields) return null

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Image
                source={user.picture ? { uri: user.picture } : defaultProfilePicture}
                style={styles.avatar}
                contentFit="cover"
              />
              <View style={styles.profileTextContainer}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.profileName} numberOfLines={1}>
                    {user ? `${user.firstName} ${user.lastName}` : "—"}
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
                  {user ? `@${user.username}` : "NA"}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{user.email || "NA"}</Text>
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
                  <Text style={styles.fieldValue}>{user.firstName || "—"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Last Name</Text>
                  <Text style={styles.fieldValue}>{user.lastName || "—"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  <Text style={styles.fieldValue}>{user.phoneNumber || "—"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <Text style={styles.fieldValue}>
                    {user && `${user.city} (${user.state}, ${user.country})`}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 16, marginBottom: 32, marginTop: 5 }}>
        <CustomButton onPress={handleLogout} color={colors.errorRed}>
          Log Out
        </CustomButton>
      </View>
    </View>
  )
}
