import CustomInput from "@/src/components/CustomInput";
import { Link, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { styles } from "@/src/styles/login.styles";
import CustomButton from "../components/CustomButton";
import { colors } from "../utils/colors";
import { BASE_URL } from "../utils/constants";
import useCustomPager from "../components/CustomPager";
import { userAtom } from "../utils/store";

const REMAINING_TIME = 60; // seconds

export default function LoginPage() {
  const email = useRef<string | null>(null);
  const verificationCode = useRef<string | null>(null);
  const { setCurrPage, setPage, setLocks, Pager } = useCustomPager({
    pageCount: 2,
    pageLocks: [false, true],
  });
  const requested = useRef(false);
  const setUser = useSetAtom(userAtom);
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleRequest(resending: boolean) {
    if (email.current === null) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    requested.current = true;
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
            email: email.current,
          }),
        },
      );
      setLocks([false, false]);
      setCurrPage(1);
      setPage(1);

      setTimeRemaining(REMAINING_TIME);

      let intervalId: number | null = null;
      intervalId = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalId) clearInterval(intervalId);
            requested.current = false;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setLoading(false);
      if (res.ok && resending) {
        Alert.alert(
          "Note",
          "Please check your email for the verification code",
        );
      }
    } catch {
      Alert.alert("Login Failed", "Invalid username or password");
    }
  }

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
          email: email.current,
          code: verificationCode.current,
        }),
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        router.replace("/");
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
        <View style={styles.pageContainer}>
          <Text style={styles.title}>Log In</Text>
          <CustomInput
            placeholder="Email"
            onChangeText={(text) => {
              email.current = text;
              requested.current = false;
              timeRemaining > 0 && setTimeRemaining(0);
              loading && setLoading(false);
            }}
            textContentType="username"
            autoComplete="username"
          />
          <CustomButton
            color={
              loading || requested.current || timeRemaining > 0
                ? colors.gray
                : colors.purple
            }
            disabled={loading || requested.current || timeRemaining > 0}
            onPress={() => handleRequest(false)}
          >
            {loading ? "Sending..." : "Continue"}
          </CustomButton>
          <Link push href="/forgot-email" style={styles.forgotLink}>
            Forgot email?
          </Link>
        </View>
      </TouchableWithoutFeedback>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.pageContainer}>
          <Text style={styles.title}>Enter Verification Code</Text>
          <CustomInput
            placeholder="6-digit code"
            onChangeText={(text) => (verificationCode.current = text)}
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={styles.verificationInfo}>
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
          <CustomButton
            color={loading ? colors.gray : colors.purple}
            disabled={loading}
            onPress={handleVerification}
          >
            {loading ? "Sending..." : "Log In"}
          </CustomButton>
        </View>
      </TouchableWithoutFeedback>
    </Pager>
  );
}
