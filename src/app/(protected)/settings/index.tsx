import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { userAtom, logOutAtom } from "../../../utils/store";
import { styles } from "../../../styles/settings.styles";
import CustomButton from "../../../components/CustomButton";
import CustomInput from "../../../components/CustomInput";
import { colors } from "../../../utils/colors";
import { useState } from "react";
import { authFetchAtom } from "../../../utils/auth-fetch";
import Feather from "@expo/vector-icons/Feather";

export default function SettingsScreen() {
  const user = useAtomValue(userAtom);
  const logout = useSetAtom(logOutAtom);
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    country: user?.country || "",
    city: user?.city || "",
  });
  const setUser = useSetAtom(userAtom);

  function handleLogoutPress() {
    logout();
  }

  function handleEditProfile() {
    setEditMode(true);
  }

  function handleCancelEdit() {
    setEditFields({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNumber: user?.phoneNumber || "",
      country: user?.country || "",
      city: user?.city || "",
    });
    setEditMode(false);
  }

  const authFetch = useSetAtom(authFetchAtom);
  async function handleSaveEdit() {
    if (!user) return;
    try {
      const response = await authFetch("/api/auth/update-profile", {
        method: "PATCH",
        body: JSON.stringify(editFields),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update profile");
      }
      const updatedUser = await response.json();
      setUser({ ...user, ...updatedUser });
      setEditMode(false);
      Alert.alert("Profile Updated", "Your changes have been saved.");
    } catch (err: any) {
      Alert.alert("Update Failed", err.message);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri:
                      user?.picture ||
                      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Default_pfp.svg/2048px-Default_pfp.svg.png",
                  }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              </View>
              <View style={styles.profileTextContainer}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={styles.profileName} numberOfLines={1}>
                    {user ? `${user.firstName} ${user.lastName}` : "—"}
                  </Text>
                  {!editMode && (
                    <TouchableOpacity
                      style={{ flexDirection: "row", alignItems: "center", paddingLeft: 12, paddingVertical: 2 }}
                      onPress={handleEditProfile}
                      accessibilityLabel="Edit profile"
                    >
                      <Feather name="edit-2" size={18} color={colors.purple} />
                      <Text style={{ color: colors.purple, fontWeight: "600", marginLeft: 4, fontSize: 15 }}>Edit</Text>
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
                      onChangeText={(text: string) => setEditFields(f => ({ ...f, firstName: text }))}
                      style={styles.editInput}
                    />
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Last Name</Text>
                  <View style={styles.editInputContainer}>
                    <CustomInput
                      defaultValue={editFields.lastName}
                      onChangeText={(text: string) => setEditFields(f => ({ ...f, lastName: text }))}
                      style={styles.editInput}
                    />
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  <View style={styles.editInputContainer}>
                    <CustomInput
                      defaultValue={editFields.phoneNumber}
                      onChangeText={(text: string) => setEditFields(f => ({ ...f, phoneNumber: text }))}
                      style={styles.editInput}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Country</Text>
                  <View style={styles.editInputContainer}>
                    <CustomInput
                      defaultValue={editFields.country}
                      onChangeText={(text: string) => setEditFields(f => ({ ...f, country: text }))}
                      style={styles.editInput}
                    />
                  </View>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <View style={styles.editInputContainer}>
                    <CustomInput
                      defaultValue={editFields.city}
                      onChangeText={(text: string) => setEditFields(f => ({ ...f, city: text }))}
                      style={styles.editInput}
                    />
                  </View>
                </View>
                <View style={styles.actionsRow}>
                  <View style={{ flex: 1 }}>
                    <CustomButton text="Save Changes" onPress={handleSaveEdit} color={colors.purple} />
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={{ flex: 1 }}>
                    <CustomButton text="Cancel" onPress={handleCancelEdit} color={colors.gray} />
                  </View>
                </View>
              </>
            ) : (
              <>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>First Name</Text>
                  <Text style={styles.fieldValue}>{user?.firstName || "—"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Last Name</Text>
                  <Text style={styles.fieldValue}>{user?.lastName || "—"}</Text>
                </View>
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Phone</Text>
                  <Text style={styles.fieldValue}>{user?.phoneNumber || "—"}</Text>
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
        <CustomButton text="Log Out" color={colors.errorRed} onPress={handleLogoutPress} />
      </View>
    </View>
  );
}
