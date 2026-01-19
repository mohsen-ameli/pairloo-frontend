import CustomInput from "@/src/components/CustomInput";
import { Link, useFocusEffect } from "expo-router";
import { useAtom, useSetAtom } from "jotai";
import { useCallback, useEffect } from "react";
import { Pressable, Text, View } from "react-native";
import { styles } from "@/src/styles/login.styles";
import { colors } from "@/src/utils/colors";
import { currPageAtom, flowAtom } from "@/src/store/pager-store";
import {
  requestEmailVerificationAtom,
  resendTimerAtom,
  authErrorsAtom,
  verifyEmailCodeAtom,
  returningUserAtom,
} from "@/src/store/auth-store";
import CustomPager from "@/src/components/CustomPager";

const INITIAL_PAGE_COUNT = 2;

export default function LoginPage() {
  const [errors, setErrors] = useAtom(authErrorsAtom);
  const [currPage, setCurrPage] = useAtom(currPageAtom);
  const [flow, setFlow] = useAtom(flowAtom);
  const [timeRemaining, setTimeRemaining] = useAtom(resendTimerAtom);
  const [returningUser, setReturningUser] = useAtom(returningUserAtom);
  const requestEmailVerification = useSetAtom(requestEmailVerificationAtom);
  const verifyEmailVerification = useSetAtom(verifyEmailCodeAtom);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setReturningUser({ email: "", emailCode: "" });
        setErrors({ ...errors, email: "", emailVerify: "" });
        setCurrPage(0);
        setTimeRemaining(0);
      };
    }, []),
  );

  // Set next/back functions based on current page
  useEffect(() => {
    setFlow({
      ...flow,
      back: () => {
        if (currPage === 1) {
          setCurrPage(0);
        }
      },
      next: () => {
        if (currPage === 0) {
          requestEmailVerification(false, false);
        } else if (currPage === 1) {
          verifyEmailVerification(false);
        }
      },
    });
  }, [currPage]);

  return (
    <CustomPager initialPageCount={INITIAL_PAGE_COUNT}>
      <View style={styles.pageContainer} key="0">
        <Text style={styles.title}>Log In</Text>
        <CustomInput
          placeholder="Email"
          value={returningUser.email}
          autoFocus
          onChangeText={(text) => {
            setReturningUser((prev) => ({ ...prev, email: text }));
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
          value={returningUser.emailCode}
          placeholder="6-digit code"
          onChangeText={(text) => {
            setReturningUser((prev) => ({ ...prev, emailCode: text }));
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
          onPress={() => requestEmailVerification(false, true)}
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
    </CustomPager>
  );
}
