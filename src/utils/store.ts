import { atom } from "jotai";
// import * as SecureStore from 'expo-secure-store';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { CountryCode } from "react-native-country-picker-modal";

WebBrowser.maybeCompleteAuthSession();

// For the sign up process
const newUser = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  emailVerified: false,
  phoneNumber: "",
  phoneVerified: false,
  country: "Canada",
  city: "",
  cca2: "CA" as CountryCode,
};
const storage = createJSONStorage<typeof newUser>(() => AsyncStorage);
export const newUserAtom = atomWithStorage("new-user", newUser, storage);

// For sign up errors
const newUserErrors = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  country: "",
  city: "",
  general: "",
};
export const signUpErrorsAtom = atom(newUserErrors);

// user atom
const user = {
  id: "",
  username: "",
  firstName: "",
  lastName: "",
  picture: "",
  email: "",
  phoneNumber: "",
  country: "",
  city: "",
  isAuthenticated: false,
  accessToken: "",
  refreshToken: "",
};
export type UserType = typeof user;
const userSecureStorage = createJSONStorage<typeof user>(() => ({
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
}));
export const userAtom = atomWithStorage("user", user, userSecureStorage);

// Sign up function atom
export const signUpAtom = atom(null, async (get, set) => {
  try {
    const userData = await get(newUserAtom);
    const payload = {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      country: userData.country,
      city: userData.city,
    };
    const res = await fetch(
      `${process.env.EXPO_PUBLIC_SERVER_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if (!res.ok) {
      set(signUpErrorsAtom, data.errors);
      return false;
    } else {
      set(userAtom, {
        ...data,
        isAuthenticated: true,
      });
      set(signUpErrorsAtom, newUserErrors);
      set(newUserAtom, newUser);
      return true;
    }
  } catch (error: any) {
    set(signUpErrorsAtom, { ...get(signUpErrorsAtom), general: error.message });
    return false;
  }
});

// Log out function atom
export const logOutAtom = atom(null, (get, set) => {
  set(userAtom, user);
});
