import { colors } from "@/src/utils/colors";
import { newUserAtom, signUpErrorsAtom } from "@/src/utils/store";
import Feather from "@expo/vector-icons/Feather";
import { useAtom } from "jotai";
import React, { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import CountryPicker, { DARK_THEME } from "react-native-country-picker-modal";
import {
  Country,
  CountryCode,
} from "react-native-country-picker-modal/lib/types";

export default function PhoneNumber() {
  const [countryCode, setCountryCode] = useState<CountryCode>("CA");
  const [visible, setVisible] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(false);
  const [newUser, setNewUser] = useAtom(newUserAtom);
  const [errors, setErrors] = useAtom(signUpErrorsAtom);

  // Get country code from storage
  useEffect(() => {
    if (newUser.cca2 && newUser.cca2 !== countryCode)
      setCountryCode(newUser.cca2);
  }, [newUser.cca2]);

  function onSelect(country: Country) {
    setCountryCode(country.cca2);
    setNewUser({
      ...newUser,
      country: country.name.toString(),
      cca2: country.cca2,
    });
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
          padding: 10,
          borderRadius: 5,
        }}
      >
        <CountryPicker
          theme={dark ? DARK_THEME : {}}
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
              width: 20,
              height: 20,
            },
          }}
        />
      </View>
      <TextInput
        style={{
          flexGrow: 1,
          borderWidth: 1,
          borderColor: colors.borderGray,
          padding: 15,
          borderRadius: 5,
        }}
        placeholder="(123) 456-7890"
        placeholderTextColor={colors.gray}
        textContentType="telephoneNumber"
        autoComplete="tel"
        defaultValue={newUser.phoneNumber}
        onChangeText={(text) => {
          setNewUser({ ...newUser, phoneNumber: text });
          setErrors({ ...errors, phoneNumber: "" });
        }}
      />
      {newUser.phoneNumber && (
        <Pressable
          style={{
            padding: 5,
            borderRadius: 5,
          }}
          onPress={() => {
            setNewUser({ ...newUser, phoneNumber: "" });
          }}
        >
          <Feather
            name="x"
            size={24}
            color={colors.dark}
            style={{ marginLeft: 5 }}
          />
        </Pressable>
      )}
    </View>
  );
}
