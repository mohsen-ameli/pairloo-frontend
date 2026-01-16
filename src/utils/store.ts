import { atom } from "jotai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { CountryCode } from "react-native-country-picker-modal";
import { BASE_URL } from "./constants";
import { UserType } from "../types/user.type";
import { chatSocketAtom } from "./socket-store";

WebBrowser.maybeCompleteAuthSession();

// For the sign up process
const newUser = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  picture: "",
  emailVerified: false,
  phoneNumber: "",
  phoneVerified: false,
  country: "Canada",
  city: "",
  state: "",
  coordinates: [0, 0] as [number, number],
  timezone: "",
  locationId: 0,
  cca2: "CA" as CountryCode,
  callingCode: "1",
};
const storage = createJSONStorage<typeof newUser>(() => AsyncStorage);
export const newUserAtom = atomWithStorage("new-user", newUser, storage);

// For sign up errors
const newUserErrors = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  emailVerify: "",
  phoneNumber: "",
  phoneVerify: "",
  country: "",
  city: "",
  general: "",
};
export const signUpErrorsAtom = atom(newUserErrors);

// user atom
const userSecureStorage = createJSONStorage<UserType>(() => ({
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
export const userAtom = atomWithStorage("user", null, userSecureStorage);

// Sign up function atom
export const signUpAtom = atom(null, async (get, set) => {
  try {
    const userData = await get(newUserAtom);
    const payload = {
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phoneNumber: `+${userData.callingCode}${userData.phoneNumber}`,
      country: userData.country,
      city: userData.city,
      state: userData.state,
      coordinates: userData.coordinates,
      timezone: userData.timezone,
      locationId: userData.locationId,
    };

    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
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

export const loginAtom = atom(null, async (get, set, email) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
    }),
  });
  const data = await res.json();

  set(userAtom, {
    ...data,
    isAuthenticated: true,
  });

  return true;
});

// Log out function atom
export const logOutAtom = atom(null, (get, set) => {
  set(userAtom, null);
  set(newUserAtom, newUser);
  set(signUpErrorsAtom, newUserErrors);
  const socket = get(chatSocketAtom);
  socket?.disconnect();
  set(chatSocketAtom, null);
});
