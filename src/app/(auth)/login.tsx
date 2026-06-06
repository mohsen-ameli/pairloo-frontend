import CustomInput from "@/src/components/CustomInput"
import { Link, useFocusEffect } from "expo-router"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useCallback, useEffect, useRef } from "react"
import { Pressable, Text, TextInput, View } from "react-native"
import { styles } from "@/src/styles/login.styles"
import { colors } from "@/src/utils/colors"
import { currPageAtom, flowAtom, pageCountAtom, resetPagerAtom } from "@/src/store/pager-store"
import {
  requestEmailVerificationAtom,
  resendTimerAtom,
  authErrorsAtom,
  verifyEmailCodeAtom,
  returningUserAtom,
} from "@/src/store/auth-store"
import { checkIfBlockedAtom, isBlockedAtom } from "@/src/store/device-store"
import BlockedAttempts from "@/src/components/BlockedAttempts"
// @ts-ignore: Multi-platform file import
import CustomPager from "@/src/components/CustomPager"

const INITIAL_PAGE_COUNT = 2

export default function LoginPage() {
  const setPageCount = useSetAtom(pageCountAtom)
  const [errors, setErrors] = useAtom(authErrorsAtom)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const timeRemaining = useAtomValue(resendTimerAtom)
  const [returningUser, setReturningUser] = useAtom(returningUserAtom)
  const requestEmailVerification = useSetAtom(requestEmailVerificationAtom)
  const verifyEmailVerification = useSetAtom(verifyEmailCodeAtom)
  const resetPager = useSetAtom(resetPagerAtom)
  const isBlocked = useAtomValue(isBlockedAtom)
  const checkIfBlocked = useSetAtom(checkIfBlockedAtom)

  // Refs for manual focus
  const emailCodeRef = useRef<TextInput>(null!)

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetPager()
      }
    }, [])
  )

  useEffect(() => {
    checkIfBlocked()
  }, [])

  // Set next/back functions based on current page
  useEffect(() => {
    setPageCount(INITIAL_PAGE_COUNT)

    let nextEnabled = false

    if (currPage === 0) {
      nextEnabled = returningUser.email.length > 0 && !isBlocked
    } else if (currPage === 1) {
      nextEnabled = returningUser.emailCode.length === 6 && !isBlocked
    }

    setFlow({
      nextEnabled,
      back: () => {
        if (currPage === 1) {
          setCurrPage(0)
        }
      },
      next: () => {
        if (currPage === 0) {
          requestEmailVerification(false, false)
        } else if (currPage === 1) {
          verifyEmailVerification(false)
        }
      },
    })
  }, [currPage, returningUser])

  // Manual focus logic
  useEffect(() => {
    if (currPage === 1 && emailCodeRef.current) {
      setTimeout(() => emailCodeRef.current?.focus(), 500)
    }
  }, [currPage])

  return (
    <CustomPager>
      <View style={styles.pageContainer} key="0">
        <Text style={styles.title}>Welcome Back!</Text>
        <CustomInput
          title="Email Address"
          errors={errors?.email || (isBlocked ? <BlockedAttempts /> : null)}
          editable={!isBlocked}
          value={returningUser.email}
          autoFocus
          onChangeText={text => {
            setReturningUser({ ...returningUser, email: text })
            setErrors({ ...errors, email: "" })
            setFlow({ ...flow, nextEnabled: text.trim().length > 0 && !isBlocked })
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Link push href="/forgot-email" style={styles.forgotLink}>
          Forgot email?
        </Link>
        <Link push href="/register" style={styles.forgotLink}>
          Don't have an account? Click to sign up.
        </Link>
      </View>

      <View style={styles.pageContainer} key="1">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          title="Code"
          errors={errors?.emailVerify}
          editable={!isBlocked}
          value={returningUser.emailCode}
          inputRef={emailCodeRef}
          placeholder="6-digit code"
          onChangeText={text => {
            setReturningUser({ ...returningUser, emailCode: text })
            setErrors({ ...errors, emailVerify: "" })
            setFlow({ ...flow, nextEnabled: text.trim().length === 6 && !isBlocked })
          }}
          keyboardType="numeric"
          maxLength={6}
        />
        <Text style={styles.verificationInfo}>
          Please check your email for the verification code.
        </Text>
        <Pressable
          onPress={() => requestEmailVerification(false, true)}
          disabled={timeRemaining > 0}
        >
          <Text
            style={[
              styles.resendText,
              {
                color: timeRemaining > 0 ? colors.gray : colors.purple,
              },
            ]}
          >
            {timeRemaining > 0 ? `Resend Code in ${timeRemaining} seconds` : "Resend Code"}
          </Text>
        </Pressable>
      </View>
    </CustomPager>
  )
}
