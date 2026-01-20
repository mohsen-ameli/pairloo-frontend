import { colors } from "@/src/utils/colors"
import { newUserAtom, authErrorsAtom } from "@/src/store/auth-store"
import Feather from "@expo/vector-icons/Feather"
import { useAtom } from "jotai"
import React, { useEffect, useState } from "react"
import { Appearance, Platform, Pressable, TextInput, View } from "react-native"
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal"
import { Country, CountryCode } from "react-native-country-picker-modal/lib/types"

const colorScheme = Appearance.getColorScheme()

export default function PhoneNumber() {
  const [countryCode, setCountryCode] = useState<CountryCode>("CA")
  const [visible, setVisible] = useState<boolean>(false)
  const [newUser, setNewUser] = useAtom(newUserAtom)
  const [errors, setErrors] = useAtom(authErrorsAtom)

  // Get country code from storage
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
          {...{
            allowFontScaling: true,
            countryCode,
            withFilter: true,
            excludeCountries: [],
            withFlag: true,
            withCurrencyButton: false,
            withCallingCodeButton: true,
            withCountryNameButton: false,
            withAlphaFilter: false,
            withCallingCode: true,
            withCurrency: false,
            withEmoji: true,
            withModal: true,
            withFlagButton: true,
            onSelect,
            disableNativeModal: false,
            preferredCountries: ["CA", "US", "AU", "GB"],
            modalProps: { visible },
            onClose: () => setVisible(false),
            onOpen: () => setVisible(true),
            closeButtonImageStyle: {
              width: Platform.OS === "ios" ? 40 : 20,
              height: Platform.OS === "ios" ? 40 : 20,
            },
          }}
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
        autoFocus
        placeholder="4160001234"
        placeholderTextColor={colors.gray}
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
          }}
        >
          <Feather name="x" size={24} color={colors.darkGray} />
        </Pressable>
      )}
    </View>
  )
}
