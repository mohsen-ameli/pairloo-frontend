import { atom } from "jotai";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { CountryCode } from "react-native-country-picker-modal";
import { BASE_URL, VERIFICATION_RESEND_TIME } from "../utils/constants";
import { UserType } from "../types/user.type";
import { chatSocketAtom, createPostSocketAtom } from "./socket-store";
import z from "zod";
import { currPageAtom, flowAtom } from "./pager-store";
import { Alert } from "react-native";
import { router } from "expo-router";

const returningUser = {
  email: "",
  emailCode: "",
};
const returningUserStorage = createJSONStorage<typeof returningUser>(
  () => AsyncStorage,
);
export const returningUserAtom = atomWithStorage(
  "new-user",
  returningUser,
  returningUserStorage,
);

// For the sign up process
const newUser = {
  username: "",
  firstName: "",
  lastName: "",
  picture: "",
  email: "",
  emailCode: "",
  emailVerified: false,
  phoneNumber: "",
  phoneCode: "",
  phoneVerified: false,
  country: "Canada",
  city: "",
  state: "",
  latitude: 0,
  longitude: 0,
  timezone: "",
  locationId: 0,
  cca2: "CA" as CountryCode,
  callingCode: "1",
};
const newUserStorage = createJSONStorage<typeof newUser>(() => AsyncStorage);
export const newUserAtom = atomWithStorage("new-user", newUser, newUserStorage);

// For sign up errors
const newUserErrors = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  emailVerify: "",
  phoneNumber: "",
  phoneVerify: "",
  general: "",
};
export const authErrorsAtom = atom(newUserErrors);

export const resendTimerAtom = atom(0);

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
      latitude: userData.latitude,
      longitude: userData.longitude,
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
      set(authErrorsAtom, data.errors);
      return false;
    } else {
      set(userAtom, data);
      set(authErrorsAtom, newUserErrors);
      set(newUserAtom, newUser);
      Alert.alert("Success", "Account created successfully!");
      router.push("/");
      return true;
    }
  } catch (error: any) {
    set(authErrorsAtom, { ...get(authErrorsAtom), general: error.message });
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
  set(userAtom, data);
  return true;
});

export const logOutAtom = atom(null, (get, set) => {
  set(userAtom, null);
  set(newUserAtom, newUser);
  set(authErrorsAtom, newUserErrors);

  // Clean chat socket
  const chatSocket = get(chatSocketAtom);
  chatSocket?.disconnect();
  set(chatSocketAtom, null);

  // Clean create post socket
  const createPostSocket = get(createPostSocketAtom);
  createPostSocket?.disconnect();
  set(createPostSocketAtom, null);
});

export const requestEmailVerificationAtom = atom(
  null,
  async (get, set, isSignUp: boolean, resending: boolean) => {
    const errors = get(authErrorsAtom);
    const flow = get(flowAtom);
    let email: string;
    if (isSignUp) {
      const newUser = await get(newUserAtom);
      email = newUser.email.trim().toLowerCase();
    } else {
      const returningUser = await get(returningUserAtom);
      email = returningUser.email.trim().toLowerCase();
    }

    const emailSchema = z.email();
    if (!emailSchema.safeParse(email).success) {
      set(authErrorsAtom, {
        ...errors,
        email: "Please enter a valid email address",
      });
      return;
    }
    set(flowAtom, { ...flow, nextEnabled: false });

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/request-email-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, isSignUp }),
        },
      );
      const data = await res.json();
      if (!res.ok && !isSignUp) {
        set(authErrorsAtom, {
          ...errors,
          email: data.error,
        });
        set(flowAtom, { ...flow, nextEnabled: true });
        return;
      } else if (!res.ok && isSignUp) {
        set(authErrorsAtom, {
          ...errors,
          email: data.error,
        });
        set(flowAtom, { ...flow, nextEnabled: true });
        return;
      }
      set(currPageAtom, get(currPageAtom) + 1);
      set(resendTimerAtom, VERIFICATION_RESEND_TIME);
      set(flowAtom, { ...flow, nextEnabled: true });

      let intervalId: number | null = null;
      intervalId = setInterval(() => {
        set(resendTimerAtom, (prev) => {
          if (prev <= 1) {
            if (intervalId) clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (res.ok && resending) {
        Alert.alert(
          "Note",
          "Please check your email for the verification code",
        );
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        email: "Failed to send verification code",
      });
      set(flowAtom, { ...flow, nextEnabled: true });
    }
  },
);

export const verifyEmailCodeAtom = atom(
  null,
  async (get, set, isSignUp: boolean) => {
    const errors = get(authErrorsAtom);
    const flow = get(flowAtom);
    let email: string, code: string;
    if (isSignUp) {
      const newUser = await get(newUserAtom);
      email = newUser.email;
      code = newUser.emailCode;
    } else {
      const returningUser = await get(returningUserAtom);
      email = returningUser.email;
      code = returningUser.emailCode;
    }

    const verifySchema = z.string().min(6).max(6);
    if (!verifySchema.safeParse(code).success) {
      set(authErrorsAtom, {
        ...errors,
        emailVerify: "Invalid verification code",
      });
      return;
    }
    set(flowAtom, { ...flow, nextEnabled: false });

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-email-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, isSignUp }),
      });
      const data = await res.json();

      if (res.ok) {
        if (isSignUp) {
          set(currPageAtom, get(currPageAtom) + 1);
          set(newUserAtom, { ...get(newUserAtom), emailVerified: true });
        } else {
          set(userAtom, data);
          set(authErrorsAtom, newUserErrors);
          set(returningUserAtom, returningUser);
          router.replace("/");
        }
      } else {
        set(authErrorsAtom, {
          ...errors,
          emailVerify: data.error,
        });
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        emailVerify: "Failed to verify code. Please try again.",
      });
    }
    set(flowAtom, { ...flow, nextEnabled: true });
  },
);

export const requestPhoneNumberVerificationAtom = atom(
  null,
  async (get, set, resending: boolean) => {
    const newUser = await get(newUserAtom);
    const errors = get(authErrorsAtom);
    const flow = get(flowAtom);
    const callingCode = newUser.callingCode;
    const phoneNumber = newUser.phoneNumber;

    if (newUser.phoneVerified) {
      set(currPageAtom, get(currPageAtom) + 1);
      set(flowAtom, { ...flow, nextEnabled: true });
      return;
    }

    const phoneSchema = z.string().min(9, "Invalid phone number");
    if (!phoneSchema.safeParse(phoneNumber).success) {
      set(authErrorsAtom, {
        ...errors,
        phoneNumber: "Please enter a valid phone number",
      });
      return;
    }
    set(flowAtom, { ...flow, nextEnabled: false });

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/request-phone-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ callingCode, phoneNumber }),
        },
      );
      const data = await res.json();
      // const res = { ok: true }; // Mock response for testing
      // const data = { error: "" }; // Mock data for testing

      if (!res.ok) {
        set(authErrorsAtom, {
          ...errors,
          phoneNumber: data.error,
        });
        set(flowAtom, { ...flow, nextEnabled: true });
        return;
      }
      set(currPageAtom, get(currPageAtom) + 1);
      set(resendTimerAtom, VERIFICATION_RESEND_TIME);
      set(flowAtom, { ...flow, nextEnabled: true });

      let intervalId: number | null = null;
      intervalId = setInterval(() => {
        set(resendTimerAtom, (prev) => {
          if (prev <= 1) {
            if (intervalId) clearInterval(intervalId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      if (res.ok && resending) {
        Alert.alert(
          "Note",
          "Please check your phone for the verification code",
        );
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        phoneNumber: "Failed to send verification code. Please try again.",
      });
      set(flowAtom, { ...flow, nextEnabled: true });
    }
  },
);

export const verifyPhoneNumberVerificationAtom = atom(
  null,
  async (get, set) => {
    const newUser = await get(newUserAtom);
    const errors = get(authErrorsAtom);
    const code = newUser.phoneCode;
    const callingCode = newUser.callingCode;
    const phoneNumber = newUser.phoneNumber;

    const verifySchema = z.string().min(6).max(6);
    if (!verifySchema.safeParse(code).success) {
      set(authErrorsAtom, {
        ...errors,
        phoneNumber: "Invalid verification code",
      });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-phone-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ callingCode, phoneNumber, code }),
      });

      if (res.ok) {
        set(currPageAtom, get(currPageAtom) + 1);
        set(newUserAtom, { ...newUser, phoneVerified: true });
      } else {
        set(authErrorsAtom, {
          ...errors,
          phoneVerify: "Invalid verification code",
        });
      }
    } catch {
      set(authErrorsAtom, {
        ...errors,
        phoneVerify: "Invalid verification code",
      });
    }
  },
);
