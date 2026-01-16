import { useAtomValue, useSetAtom } from "jotai";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { userAtom, logOutAtom } from "@/src/utils/store";
import { styles } from "@/src/styles/settings.styles";
import CustomButton from "@/src/components/CustomButton";
import CustomInput from "@/src/components/CustomInput";
import LocationSelector from "@/src/components/LocationSelector";
import { colors } from "@/src/utils/colors";
import { useState } from "react";
import { authFetchAtom } from "../../../utils/auth-fetch";
import Feather from "@expo/vector-icons/Feather";
// @ts-ignore
import default_pfp from "@/assets/images/default_pfp.png";
import CustomHeader from "@/src/components/CustomHeader";

export default function SettingsScreen() {
  const user = useAtomValue(userAtom);
  const logout = useSetAtom(logOutAtom);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    country: user?.country || "",
    city: user?.city || "",
    state: user?.state || "",
    coordinates: user?.coordinates || [0, 0],
    timezone: user?.timezone || "",
    locationRef: user?.locationRef || 0,
  });
  const setUser = useSetAtom(userAtom);
  const authFetch = useSetAtom(authFetchAtom);

  async function handleSaveEdit() {
    if (!user) return;
    try {
      const response = await authFetch("/api/settings/update-profile", {
        method: "PATCH",
        body: JSON.stringify(editFields),
      });
      if (!response.ok) {
        let errorMessage = "Failed to update profile";
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {}
        Alert.alert("Update Failed", errorMessage);
        return;
      }
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      setEditMode(false);
      Alert.alert("Profile Updated", "Your changes have been saved.");
    } catch (err: any) {
      Alert.alert(
        "Update Failed",
        err?.message || "An unexpected error occurred."
      );
    }
  }

  function handleCancelEdit() {
    setEditFields({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      country: user?.country || "",
      city: user?.city || "",
      state: user?.state || "",
      coordinates: user?.coordinates || [0, 0],
      timezone: user?.timezone || "",
      locationRef: user?.locationRef || 0,
    });
    setEditMode(false);
  }

  function handleLogout() {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: logout,
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="Settings" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri: user?.picture || default_pfp,
                  }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </View>
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
              <Text style={styles.fieldValue}>{user?.email || "NA"}</Text>
            </View>
            {editMode ? (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>First Name</Text>
                  <View style={styles.editInputContainer}>
                    <CustomInput
                      defaultValue={editFields.firstName}
                      onChangeText={(text: string) =>
                        setEditFields((f) => ({ ...f, firstName: text }))
                      }
                      style={styles.editInput}
                    />
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Last Name</Text>
                  <View style={styles.editInputContainer}>
                    <CustomInput
                      defaultValue={editFields.lastName}
                      onChangeText={(text: string) =>
                        setEditFields((f) => ({ ...f, lastName: text }))
                      }
                      style={styles.editInput}
                    />
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Location</Text>
                  <View style={styles.editInputContainer}>
                    <LocationSelector
                      onLocationChange={(locationObj) => {
                        if (locationObj && typeof locationObj === "object") {
                          setEditFields((f) => ({
                            firstName: f.firstName,
                            lastName: f.lastName,
                            city: locationObj.name,
                            state: locationObj.state_name,
                            country: locationObj.country_name,
                            coordinates: [locationObj.longitude, locationObj.latitude],
                            timezone: locationObj.timezone,
                            locationRef: locationObj._id,
                          }));
                        }
                      }}
                      selectedCity={editFields.city + (editFields.state ? ", " + editFields.state : "") + (editFields.country ? ", " + editFields.country : "")}
                    />
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <View style={{ flex: 1 }}>
                    <CustomButton
                      onPress={handleSaveEdit}
                      color={colors.purple}
                    >
                      Save Changes
                    </CustomButton>
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <CustomButton
                      onPress={handleCancelEdit}
                      color={colors.gray}
                    >
                      Cancel
                    </CustomButton>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>First Name</Text>
                  <Text style={styles.fieldValue}>
                    {user?.firstName || "—"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Last Name</Text>
                  <Text style={styles.fieldValue}>{user?.lastName || "—"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  <Text style={styles.fieldValue}>
                    {user?.phoneNumber || "—"}
                  </Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Country</Text>
                  <Text style={styles.fieldValue}>{user?.country || "—"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <Text style={styles.fieldValue}>{user?.city || "—"}</Text>
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
  );
}
