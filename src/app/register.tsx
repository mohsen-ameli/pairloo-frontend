import { useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import CustomInput from "../components/CustomInput";
import PhoneNumber from "../components/phoneNumber";
import LocationSelector from "../components/LocationSelector";
import { colors } from "../utils/colors";
import { newUserAtom, signUpAtom, signUpErrorsAtom } from "../utils/store";
import useCustomPager, { flowAtom } from "../components/CustomPager";
import { styles } from "../styles/register.styles";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BASE_URL,
  REGISTER_USERNAME_CHECK_INTERVAL,
  VERIFICATION_RESEND_TIME,
} from "../utils/constants";
import z from "zod";
import { useAtomCallback } from "jotai/utils";

export default function Register() {
  const router = useRouter();
  const signUp = useSetAtom(signUpAtom);
  const [newUser, setNewUser] = useAtom(newUserAtom);
  const [errors, setErrors] = useAtom(signUpErrorsAtom);
  const emailVerificationCode = useRef("");
  const phoneVerificationCode = useRef("");
  const requested = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flow, setFlow] = useAtom(flowAtom);
  const usernameTimeout = useRef<number>(null);
  const { setCurrPage, setPage, Pager, currPage } = useCustomPager({
    initialPageCount: 5,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setFlow({
        back: null,
        next: null,
        backEnabled: true,
        nextEnabled: true,
      });
      setPage(0);
      setCurrPage(0);
    };
  }, []);

  // Set next/back functions based on current page
  useEffect(() => {
    setFlow({
      ...flow,
      back: () => {
        setCurrPage(currPage - 1);
        setPage(currPage - 1);
      },
      next: () => {
        if (currPage === 0) {
          // Phone number page
          handlePhoneNumberRequest(false);
        } else if (currPage === 1) {
          // Phone verification
          handlePhoneNumberVerification();
        } else if (currPage === 2) {
          // Email page
          handleEmailRequest(false);
        } else if (currPage === 3) {
          // Email verification
          handleEmailVerification();
        } else if (currPage === 4) {
          // User info page
          signUpHandler();
        }
      },
    });
  }, [currPage]);

  const handleErrors = useAtomCallback(
    useCallback((get) => {
      const signUpErrors = get(signUpErrorsAtom);
      if (signUpErrors.phoneNumber) {
        setCurrPage(0);
        setPage(0);
      } else if (signUpErrors.email) {
        setCurrPage(2);
        setPage(2);
      } else if (
        signUpErrors.username ||
        signUpErrors.firstName ||
        signUpErrors.lastName ||
        signUpErrors.country ||
        signUpErrors.city
      ) {
        setCurrPage(4);
        setPage(4);
      } else if (signUpErrors.general) {
        Alert.alert("Error", signUpErrors.general);
      }
    }, [])
  );

  async function handleUsername(text: string) {
    setNewUser({ ...newUser, username: text });
    setErrors({ ...errors, username: "" });
    if (usernameTimeout.current) {
      clearTimeout(usernameTimeout.current);
    }
    usernameTimeout.current = setTimeout(async () => {
      if (text.length > 0) {
        const res = await fetch(
          `${BASE_URL}/api/auth/username-available?username=${text}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        if (!res.ok) {
          setErrors((prev) => ({
            ...prev,
            username: data.errors.username,
          }));
        }
      }
    }, REGISTER_USERNAME_CHECK_INTERVAL);
  }

  async function signUpHandler() {
    const successful = await signUp();
    if (successful) {
      Alert.alert("Success", "Account created successfully!");
      router.push("/");
    } else {
      handleErrors();
    }
  }

  const handleEmailRequest = useAtomCallback(
    useCallback(async (get, set, resending: boolean) => {
      const newUser = await get(newUserAtom);
      if (newUser.emailVerified) {
        setCurrPage(4);
        setPage(4);
        set(flowAtom, { ...get(flowAtom), nextEnabled: true });
        return;
      }

      const emailSchema = z.email();
      if (!newUser.email || !emailSchema.safeParse(newUser.email).success) {
        set(signUpErrorsAtom, {
          ...get(signUpErrorsAtom),
          email: "Please enter a valid email address",
        });
        return;
      }
      set(flowAtom, { ...get(flowAtom), nextEnabled: false });

      try {
        const res = await fetch(
          `${BASE_URL}/api/auth/request-email-verification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: newUser.email,
              signUp: true,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          set(signUpErrorsAtom, {
            ...get(signUpErrorsAtom),
            email: data.error,
          });
          set(flowAtom, { ...get(flowAtom), nextEnabled: true });
          return;
        }
        setCurrPage(3);
        setPage(3);
        setTimeRemaining(VERIFICATION_RESEND_TIME);
        set(flowAtom, { ...get(flowAtom), nextEnabled: true });

        let intervalId: number | null = null;
        intervalId = setInterval(() => {
          setTimeRemaining((prev) => {
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
            "Please check your email for the verification code"
          );
        }
      } catch {
        set(signUpErrorsAtom, {
          ...get(signUpErrorsAtom),
          email: "Failed to send verification code. Please try again.",
        });
        set(flowAtom, { ...get(flowAtom), nextEnabled: true });
      }
    }, [])
  );

  const handlePhoneNumberRequest = useAtomCallback(
    useCallback(async (get, set, resending: boolean) => {
      const newUser = await get(newUserAtom);
      if (newUser.phoneVerified) {
        setCurrPage(2);
        setPage(2);
        set(flowAtom, { ...get(flowAtom), nextEnabled: true });
        return;
      }

      const phoneSchema = z.string().min(9, "Invalid phone number");
      if (
        !newUser.phoneNumber ||
        !phoneSchema.safeParse(newUser.phoneNumber).success
      ) {
        set(signUpErrorsAtom, {
          ...get(signUpErrorsAtom),
          phoneNumber: "Please enter a valid phone number",
        });
        return;
      }
      set(flowAtom, { ...get(flowAtom), nextEnabled: false });

      try {
        const res = await fetch(
          `${BASE_URL}/api/auth/request-phone-verification`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              callingCode: newUser.callingCode,
              phoneNumber: newUser.phoneNumber,
              signUp: true,
            }),
          }
        );
        const data = await res.json();
        if (!res.ok) {
          set(signUpErrorsAtom, {
            ...get(signUpErrorsAtom),
            phoneNumber: data.error,
          });
          set(flowAtom, { ...get(flowAtom), nextEnabled: true });
          return;
        }
        setCurrPage(1);
        setPage(1);
        setTimeRemaining(VERIFICATION_RESEND_TIME);
        set(flowAtom, { ...get(flowAtom), nextEnabled: true });

        let intervalId: number | null = null;
        intervalId = setInterval(() => {
          setTimeRemaining((prev) => {
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
            "Please check your phone for the verification code"
          );
        }
      } catch {
        set(signUpErrorsAtom, {
          ...get(signUpErrorsAtom),
          phoneNumber: "Failed to send verification code. Please try again.",
        });
        set(flowAtom, { ...get(flowAtom), nextEnabled: true });
      }
    }, [])
  );

  async function handleEmailVerification() {
    const verifySchema = z.string().min(6).max(6);
    const codeClean = emailVerificationCode.current.trim();
    if (!verifySchema.safeParse(codeClean).success) {
      setErrors({ ...errors, emailVerify: "Invalid verification code" });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-email-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newUser.email,
          code: emailVerificationCode.current,
          signUp: true,
        }),
      });

      if (res.ok) {
        setCurrPage(4);
        setPage(4);
        setNewUser({ ...newUser, emailVerified: true });
      } else {
        setErrors({
          ...errors,
          emailVerify: "Invalid verification code",
        });
      }
    } catch {
      setErrors({
        ...errors,
        emailVerify: "Invalid verification code",
      });
    }
  }

  async function handlePhoneNumberVerification() {
    const verifySchema = z.string().min(6).max(6);
    const codeClean = phoneVerificationCode.current.trim();
    if (!verifySchema.safeParse(codeClean).success) {
      setErrors({ ...errors, phoneNumber: "Invalid verification code" });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/verify-phone-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          callingCode: newUser.callingCode,
          phoneNumber: newUser.phoneNumber,
          code: phoneVerificationCode.current,
          signUp: true,
        }),
      });

      if (res.ok) {
        setCurrPage(2);
        setPage(2);
        setNewUser({ ...newUser, phoneVerified: true });
      } else {
        setErrors({
          ...errors,
          phoneVerify: "Invalid verification code",
        });
      }
    } catch {
      setErrors({
        ...errors,
        phoneVerify: "Invalid verification code",
      });
    }
  }

  return (
    <Pager>
      <View style={styles.pageContainer} key="0">
        <Text style={styles.title}>Phone Number</Text>
        <PhoneNumber />
        {errors.phoneNumber && (
          <Text style={styles.error}>{errors.phoneNumber}</Text>
        )}
        {!newUser.phoneVerified && (
          <Text style={styles.note}>We will send you a verification code.</Text>
        )}
      </View>

      <View style={styles.pageContainer} key="1">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          placeholder="6-digit code"
          onChangeText={(text) => {
            setErrors({ ...errors, phoneVerify: "" });
            phoneVerificationCode.current = text;
          }}
          autoFocus
          keyboardType="numeric"
          maxLength={6}
        />
        {errors.phoneVerify && (
          <Text
            style={{
              color: "tomato",
            }}
          >
            {errors.phoneVerify}
          </Text>
        )}
        <Text style={styles.note}>
          Please check your email for the verification code.
        </Text>
        <Pressable
          onPress={() => handlePhoneNumberRequest(true)}
          disabled={requested.current || timeRemaining > 0}
        >
          <Text
            style={[
              styles.resendText,
              {
                color:
                  requested.current || timeRemaining > 0
                    ? colors.gray
                    : colors.purple,
              },
            ]}
          >
            {timeRemaining > 0
              ? `Resend Code in ${timeRemaining} seconds`
              : "Resend Code"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.pageContainer} key="2">
        <Text
          style={{
            color: colors.dark,
            fontSize: 30,
            fontWeight: "bold",
            marginBottom: 20,
            alignSelf: "center",
          }}
        >
          What's your email?
        </Text>
        <CustomInput
          onChangeText={(text) => {
            setNewUser({ ...newUser, email: text.trim().toLowerCase() });
            setErrors({ ...errors, email: "" });
          }}
          autoFocus
          defaultValue={newUser.email}
          placeholder="Email Address"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {errors.email && (
          <Text
            style={{
              color: "tomato",
            }}
          >
            {errors.email}
          </Text>
        )}
        {!newUser.emailVerified && (
          <Text style={styles.note}>We'll send you a verification code.</Text>
        )}
      </View>

      <View style={styles.pageContainer} key="3">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          placeholder="6-digit code"
          onChangeText={(text) => {
            setErrors({ ...errors, emailVerify: "" });
            emailVerificationCode.current = text;
          }}
          autoFocus
          keyboardType="numeric"
          maxLength={6}
        />
        {errors.emailVerify && (
          <Text
            style={{
              color: "tomato",
            }}
          >
            {errors.emailVerify}
          </Text>
        )}
        <Text style={styles.note}>
          Please check your email for the verification code.
        </Text>
        <Pressable
          onPress={() => handleEmailRequest(true)}
          disabled={requested.current || timeRemaining > 0}
        >
          <Text
            style={[
              styles.resendText,
              {
                color:
                  requested.current || timeRemaining > 0
                    ? colors.gray
                    : colors.purple,
              },
            ]}
          >
            {timeRemaining > 0
              ? `Resend Code in ${timeRemaining} seconds`
              : "Resend Code"}
          </Text>
        </Pressable>
      </View>

      <ScrollView key="4" keyboardShouldPersistTaps="handled">
        <View style={styles.pageContainer}>
          <Text
            style={{
              color: colors.dark,
              fontSize: 30,
              marginBottom: 20,
              fontWeight: "bold",
              alignSelf: "center",
            }}
          >
            Let's get to know you!
          </Text>
          <CustomInput
            onChangeText={handleUsername}
            defaultValue={newUser.username}
            autoFocus
            placeholder="Username"
          />
          {errors.username && (
            <Text
              style={{
                color: "tomato",
              }}
            >
              {errors.username}
            </Text>
          )}
          <CustomInput
            onChangeText={(text) => {
              setNewUser({ ...newUser, firstName: text });
              setErrors({ ...errors, firstName: "" });
            }}
            defaultValue={newUser.firstName}
            placeholder="First Name"
          />
          {errors.firstName && (
            <Text
              style={{
                color: "tomato",
              }}
            >
              {errors.firstName}
            </Text>
          )}
          <CustomInput
            onChangeText={(text) => {
              setNewUser({ ...newUser, lastName: text });
              setErrors({ ...errors, lastName: "" });
            }}
            defaultValue={newUser.lastName}
            placeholder="First Name"
          />
          {errors.lastName && (
            <Text
              style={{
                color: "tomato",
              }}
            >
              {errors.lastName}
            </Text>
          )}
          <LocationSelector
            onLocationChange={(location) => {
              setNewUser({
                ...newUser,
                locationId: location._id,
                city: location.name,
                state: location.state_name,
                country: location.country_name,
                latitude: location.latitude,
                longitude: location.longitude,
                timezone: location.timezone,
              });
            }}
          />
          {errors.city && (
            <Text
              style={{
                color: "tomato",
              }}
            >
              {errors.city}
            </Text>
          )}
        </View>
      </ScrollView>
    </Pager>
  );
}
