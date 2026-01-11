import CustomInput from "@/src/components/CustomInput";
import { Link, useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { styles } from "@/src/styles/login.styles";
import { colors } from "../utils/colors";
import { BASE_URL, VERIFICATION_RESEND_TIME } from "../utils/constants";
import useCustomPager, { flowAtom } from "../components/CustomPager";
import { userAtom } from "../utils/store";

export default function LoginPage() {
  const email = useRef("");
  const verificationCode = useRef<string | null>(null);
  const { setCurrPage, setPage, Pager, currPage } = useCustomPager({
    initialPageCount: 2,
  });
  const setUser = useSetAtom(userAtom);
  const [flow, setFlow] = useAtom(flowAtom);
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFlow({
      ...flow,
      back: () => {
        if (currPage === 1) {
          setCurrPage(0);
          setPage(0);
        }
      },
      next: () => {
        if (currPage === 0) {
          handleRequest(false);
        } else if (currPage === 1) {
          handleVerification();
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

  async function handleRequest(resending: boolean) {
    const emailSchema = z.email();
    if (!email.current || !emailSchema.safeParse(email.current).success) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    setFlow({ ...flow, nextEnabled: false });
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
            signUp: false,
          }),
        }
      );
      if (!res.ok) {
        Alert.alert("Error", "This email is not registered.");
        setLoading(false);
        setFlow({ ...flow, nextEnabled: true });
        return;
      }
      setCurrPage(1);
      setPage(1);
      setTimeRemaining(VERIFICATION_RESEND_TIME);
      setFlow({ ...flow, nextEnabled: true });

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
      Alert.alert("Login Failed", "Invalid username or password");
      setLoading(false);
      setFlow({ ...flow, nextEnabled: true });
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
          signUp: false,
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
      <View style={styles.pageContainer} key="0">
        <Text style={styles.title}>Log In</Text>
        <CustomInput
          placeholder="Email"
          value={email.current}
          autoFocus
          onChangeText={(text) => {
            email.current = text.trim().toLowerCase();
            setFlow({ ...flow, nextEnabled: true });
            timeRemaining > 0 && setTimeRemaining(0);
            loading && setLoading(false);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Link push href="/forgot-email" style={styles.forgotLink}>
          Forgot email?
        </Link>
      </View>

      <View style={styles.pageContainer} key="1">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          autoFocus
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
          disabled={!flow.nextEnabled || timeRemaining > 0}
        >
          <Text
            style={[
              styles.resendText,
              {
                color:
                  !flow.nextEnabled || timeRemaining > 0
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
    </Pager>
  );
}
