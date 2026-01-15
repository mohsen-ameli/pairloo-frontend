import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import {
  Alert,
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomInput from "../components/CustomInput";
import PhoneNumber from "../components/phoneNumber";
import CountryCitySelector from "../components/CountryCitySelector";
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
  const signUp = useAtom(signUpAtom)[1];
  const [newUser, setNewUser] = useAtom(newUserAtom);
  const [errors, setErrors] = useAtom(signUpErrorsAtom);
  const verificationCode = useRef<string | null>(null);
  const requested = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [flow, setFlow] = useAtom(flowAtom);
  const [loading, setLoading] = useState(false);
  const usernameTimeout = useRef<number>(null);
  const { setCurrPage, setPage, Pager, currPage } = useCustomPager({
    initialPageCount: 5,
  });

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
          // Email page
          handleRequest(false);
        } else if (currPage === 2) {
          // Email verification
          handleVerification();
        } else if (currPage === 3) {
          // User info page
          setCurrPage(4);
          setPage(4);
        } else if (currPage === 4) {
          // Final sign up
          signUpHandler();
        }
      },
    });

    return () => {
      setFlow({
        back: null,
        next: null,
        backEnabled: true,
        nextEnabled: true,
      });
    };
  }, [currPage]);

  const handleErrors = useAtomCallback(
    useCallback((get) => {
      const signUpErrors = get(signUpErrorsAtom);
      if (signUpErrors.phoneNumber) {
        setCurrPage(0);
        setPage(0);
      } else if (signUpErrors.email) {
        setCurrPage(1);
        setPage(1);
      } else if (
        signUpErrors.username ||
        signUpErrors.firstName ||
        signUpErrors.lastName
      ) {
        setCurrPage(3);
        setPage(3);
      } else if (signUpErrors.country || signUpErrors.city) {
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

  const handlePhoneNumberRequest = useAtomCallback(
    useCallback(async (get, set, resending: boolean) => {
      const newUser = await get(newUserAtom);
      const phoneSchema = z.string().min(9, "Invalid phone number");
      if (
        !newUser.phoneNumber ||
        !phoneSchema.safeParse(newUser.phoneNumber).success
      ) {
        set(signUpErrorsAtom, {
          ...errors,
          phoneNumber: "Please enter a valid phone number",
        });
        return;
      }

      // For simplicity, we'll assume phone verification is done instantly
      set(newUserAtom, { ...newUser, phoneVerified: true });
      setCurrPage(1);
      setPage(1);
    }, [])
  );

  const handleRequest = useAtomCallback(
    useCallback(async (get, set, resending: boolean) => {
      const newUser = await get(newUserAtom);
      const flow = get(flowAtom);
      if (newUser.emailVerified) {
        setCurrPage(3);
        setPage(3);
        setLoading(false);
        set(flowAtom, { ...flow, nextEnabled: true });
        return;
      }

      const emailSchema = z.email();
      if (!newUser.email || !emailSchema.safeParse(newUser.email).success) {
        set(signUpErrorsAtom, {
          ...errors,
          email: "Please enter a valid email address",
        });
        return;
      }
      set(flowAtom, { ...flow, nextEnabled: false });
      setLoading(true);

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
            ...errors,
            email: data.error,
          });
          setLoading(false);
          set(flowAtom, { ...flow, nextEnabled: true });
          return;
        }
        setCurrPage(2);
        setPage(2);
        setTimeRemaining(VERIFICATION_RESEND_TIME);
        set(flowAtom, { ...flow, nextEnabled: true });

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

        setLoading(false);
        if (res.ok && resending) {
          Alert.alert(
            "Note",
            "Please check your email for the verification code"
          );
        }
      } catch {
        set(signUpErrorsAtom, {
          ...errors,
          email: "Failed to send verification code. Please try again.",
        });
        setLoading(false);
        set(flowAtom, { ...flow, nextEnabled: true });
      }
    }, [])
  );

  async function handleVerification() {
    if (verificationCode.current === null) {
      Alert.alert("Error", "Please enter the verification code");
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
          code: verificationCode.current,
          signUp: true,
        }),
      });

      if (res.ok) {
        setCurrPage(3);
        setPage(3);
        setNewUser({ ...newUser, emailVerified: true });
      } else {
        Alert.alert("Login Failed", "Invalid verification code");
      }
    } catch {
      Alert.alert("Login Failed", "Invalid verification code");
    }
  }

  return (
    <Pager>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.pageContainer} key="0">
          <Text style={styles.title}>Phone Number</Text>
          <PhoneNumber />
          {errors.phoneNumber && (
            <Text style={styles.error}>{errors.phoneNumber}</Text>
          )}
          {!newUser.phoneVerified && (
            <Text style={styles.note}>
              We will send you a verification code.
            </Text>
          )}
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.pageContainer} key="1">
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
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.pageContainer} key="2">
          <Text style={styles.title}>Enter Verification Code</Text>
          <CustomInput
            placeholder="6-digit code"
            onChangeText={(text) => {
              verificationCode.current = text;
            }}
            autoFocus
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={styles.note}>
            Please check your email for the verification code.
          </Text>
          <Pressable
            onPress={() => handleRequest(true)}
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
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.pageContainer} key="3">
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
            placeholder="Last Name"
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
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.pageContainer} key="4">
          <Text
            style={{
              color: colors.dark,
              fontSize: 30,
              fontWeight: "bold",
              marginBottom: 20,
            }}
          >
            Where are you based?
          </Text>
          <CountryCitySelector
            onCountryChange={(country) => {
              setNewUser({ ...newUser, country });
              setErrors({ ...errors, country: "" });
            }}
            onCityChange={(city) => {
              setNewUser({ ...newUser, city });
              setErrors({ ...errors, city: "" });
            }}
            selectedCountry={newUser.country}
            selectedCity={newUser.city}
          />
          {errors.country && (
            <Text
              style={{
                color: "tomato",
              }}
            >
              {errors.country}
            </Text>
          )}
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
      </TouchableWithoutFeedback>
    </Pager>
  );
}
