import CustomInput from "@/src/components/CustomInput";
import { Link, useRouter } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { z } from "zod";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { styles } from "@/src/styles/login.styles";
import { colors } from "../utils/colors";
import { BASE_URL, VERIFICATION_RESEND_TIME } from "../utils/constants";
import useCustomPager, { flowAtom } from "../components/CustomPager";
import { userAtom } from "../utils/store";
import { useAtomCallback } from "jotai/utils";

export default function LoginPage() {
  const email = useRef("");
  const verificationCode = useRef("");
  const [errors, setErrors] = useState<{
    email: string;
    emailVerify: string;
  }>({ email: "", emailVerify: "" });
  const { setCurrPage, setPage, Pager, currPage } = useCustomPager({
    initialPageCount: 2,
  });
  const setUser = useSetAtom(userAtom);
  const [flow, setFlow] = useAtom(flowAtom);
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(0);

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
  }, [currPage]);

  const handleRequest = useAtomCallback(
    useCallback(async (get, set, resending: boolean) => {
      const emailSchema = z.email();
      const emailClean = email.current.trim().toLowerCase();
      if (!emailSchema.safeParse(emailClean).success) {
        setErrors({ ...errors, email: "Please enter a valid email address" });
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
              email: emailClean,
              signUp: false,
            }),
          }
        );
        if (!res.ok) {
          setErrors({ ...errors, email: "This email is not registered" });
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
            "Please check your email for the verification code"
          );
        }
      } catch {
        setErrors({ ...errors, email: "Failed to send verification code" });
        set(flowAtom, { ...get(flowAtom), nextEnabled: true });
      }
    }, [])
  );

  const handleVerification = useAtomCallback(
    useCallback(async (get, set) => {
      const verifySchema = z.string().min(6).max(6);
      const codeClean = verificationCode.current.trim();
      if (!verifySchema.safeParse(codeClean).success) {
        setErrors({ ...errors, emailVerify: "Invalid verification code" });
        return;
      }
      set(flowAtom, { ...get(flowAtom), nextEnabled: false });

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
          setErrors({ ...errors, emailVerify: "Invalid verification code" });
        }
      } catch {
        setErrors({ ...errors, emailVerify: "Invalid verification code" });
      }
      set(flowAtom, { ...get(flowAtom), nextEnabled: true });
    }, [])
  );

  return (
    <Pager>
      <View style={styles.pageContainer} key="0">
        <Text style={styles.title}>Log In</Text>
        <CustomInput
          placeholder="Email"
          value={email.current}
          autoFocus
          onChangeText={(text) => {
            email.current = text;
            setErrors({ ...errors, email: "" });
            setFlow({ ...flow, nextEnabled: true });
            timeRemaining > 0 && setTimeRemaining(0);
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        <Link push href="/forgot-email" style={styles.forgotLink}>
          Forgot email?
        </Link>
      </View>

      <View style={styles.pageContainer} key="1">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          autoFocus
          value={verificationCode.current}
          placeholder="6-digit code"
          onChangeText={(text) => {
            verificationCode.current = text;
            setErrors({ ...errors, emailVerify: "" });
            setFlow({ ...flow, nextEnabled: true });
          }}
          keyboardType="numeric"
          maxLength={6}
        />
        {errors.emailVerify && (
          <Text style={styles.errorText}>{errors.emailVerify}</Text>
        )}
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
