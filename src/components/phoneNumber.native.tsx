import { colors } from "@/src/utils/colors"
import { newUserAtom, authErrorsAtom } from "@/src/store/auth-store"
import Feather from "@expo/vector-icons/Feather"
import { useAtom, useAtomValue } from "jotai"
import React, { useEffect, useState } from "react"
import { Appearance, Platform, Pressable, TextInput, View } from "react-native"
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal"
import { Country, CountryCode } from "react-native-country-picker-modal/lib/types"
import { flowAtom } from "@/src/store/pager-store"
import { isBlockedAtom } from "@/src/store/device-store"

const colorScheme = Appearance.getColorScheme()

export default function PhoneNumberNative() {
  const [countryCode, setCountryCode] = useState("CA")
  const [visible, setVisible] = useState<boolean>(false)
  const [newUser, setNewUser] = useAtom(newUserAtom)
  const [errors, setErrors] = useAtom(authErrorsAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const isBlocked = useAtomValue(isBlockedAtom)

  useEffect(() => {
    if (newUser.cca2 && newUser.cca2 !== countryCode) setCountryCode(newUser.cca2)
  }, [newUser.cca2])

  function onSelect(country: Country) {
    setCountryCode(country.cca2)
    setNewUser({
      ...newUser,
      phoneVerified: false,
      country: country.name.toString(),
      cca2: country.cca2,
      callingCode: country.callingCode[0],
    })
  }

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
          paddingVertical: Platform.OS === "ios" ? 7 : 14,
          paddingHorizontal: 10,
          borderRadius: 5,
        }}
      >
        <CountryPicker
          theme={colorScheme === "dark" ? DARK_THEME : {}}
          countryCode={countryCode as CountryCode}
          withFilter={true}
          excludeCountries={[]}
          withFlag={true}
          withCurrencyButton={false}
          withCallingCodeButton={true}
          withCountryNameButton={false}
          withAlphaFilter={false}
          withCallingCode={true}
          withCurrency={false}
          withEmoji={true}
          withModal={true}
          withFlagButton={true}
          onSelect={onSelect}
          disableNativeModal={false}
          preferredCountries={["CA", "US", "AU", "GB"]}
          modalProps={{ visible: visible && !isBlocked }}
          onClose={() => setVisible(false)}
          onOpen={() => setVisible(true)}
          visible={visible && !isBlocked}
        />
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
        editable={!isBlocked}
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
