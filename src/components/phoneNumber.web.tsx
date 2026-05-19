import { colors } from "@/src/utils/colors"
import { newUserAtom, authErrorsAtom } from "@/src/store/auth-store"
import Feather from "@expo/vector-icons/Feather"
import { useAtom } from "jotai"
import React from "react"
import { Pressable, TextInput, View } from "react-native"
import { Picker } from "@react-native-picker/picker"
import { flowAtom } from "@/src/store/pager-store"

const countryOptions: Array<{ code: string; name: string; callingCode: string }> = [
  { code: "CA", name: "Canada", callingCode: "1" },
  { code: "US", name: "United States", callingCode: "1" },
  { code: "AU", name: "Australia", callingCode: "61" },
  { code: "GB", name: "United Kingdom", callingCode: "44" },
]

export default function PhoneNumber() {
  const [newUser, setNewUser] = useAtom(newUserAtom)
  const [errors, setErrors] = useAtom(authErrorsAtom)
  const [flow, setFlow] = useAtom(flowAtom)

  const selectedCountry =
    countryOptions.find(option => option.code === newUser.cca2) ?? countryOptions[0]

  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          borderWidth: 1,
          borderColor: colors.borderGray,
          borderRadius: 5,
          overflow: "hidden",
          minWidth: 150,
        }}
      >
        <Picker
          selectedValue={selectedCountry.code}
          onValueChange={value => {
            const chosen = countryOptions.find(option => option.code === value) ?? countryOptions[0]
            setNewUser({
              ...newUser,
              phoneVerified: false,
              country: chosen.name,
              cca2: chosen.code,
              callingCode: chosen.callingCode,
            })
          }}
        >
          {countryOptions.map(option => (
            <Picker.Item key={option.code} label={option.name} value={option.code} />
          ))}
        </Picker>
      </View>
      <TextInput
        style={{
          color: colors.dark,
          flexGrow: 1,
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: 15,
          borderRadius: 5,
          fontSize: 18,
        }}
        value={newUser.phoneNumber}
        autoFocus
        placeholder="4160001234"
        placeholderTextColor={colors.muted}
        autoComplete="off"
        keyboardType="number-pad"
        maxLength={14}
        defaultValue={newUser.phoneNumber}
        onChangeText={text => {
          setNewUser({
            ...newUser,
            phoneNumber: text.trim(),
            phoneVerified: false,
          })
          setErrors({ ...errors, phoneNumber: "" })
          setFlow({ ...flow, nextEnabled: text.trim().length > 0 })
        }}
      />
      {newUser.phoneNumber && (
        <Pressable
          style={{
            position: "absolute",
            right: 10,
            backgroundColor: colors.lightGray,
            padding: 5,
            borderRadius: 5,
          }}
          onPress={() => {
            setNewUser({ ...newUser, phoneNumber: "" })
            setErrors({ ...errors, phoneNumber: "" })
            setFlow({ ...flow, nextEnabled: false })
          }}
        >
          <Feather name="x" size={24} color={colors.darkGray} />
        </Pressable>
      )}
    </View>
  )
}
