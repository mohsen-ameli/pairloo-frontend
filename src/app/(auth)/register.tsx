import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Platform, Pressable, ScrollView, Text, View } from "react-native"
import CustomInput from "@/src/components/CustomInput"
import LocationSelector from "@/src/components/LocationSelector"
import { colors } from "@/src/utils/colors"
import {
  newUserAtom,
  signUpAtom,
  authErrorsAtom,
  requestEmailVerificationAtom,
  verifyEmailCodeAtom,
  requestPhoneNumberVerificationAtom,
  verifyPhoneNumberVerificationAtom,
  resendTimerAtom,
  verifyUserInfoAtom,
} from "@/src/store/auth-store"
import { styles } from "@/src/styles/register.styles"
import { useCallback, useEffect, useRef, useState } from "react"
import { TextInput } from "react-native"
import { BASE_URL, REGISTER_USERNAME_CHECK_INTERVAL } from "@/src/utils/constants"
import { currPageAtom, flowAtom, pageCountAtom, resetPagerAtom } from "@/src/store/pager-store"
import { useFocusEffect, useRouter } from "expo-router"
import { Image } from "expo-image"
import Feather from "@expo/vector-icons/Feather"
import { checkIfBlockedAtom, isBlockedAtom } from "@/src/store/device-store"
import BlockedAttempts from "@/src/components/BlockedAttempts"
import PhoneNumber from "@/src/components/PhoneNumber"
// @ts-ignore: Multi-platform file import
import CustomPager from "@/src/components/CustomPager"

const defaultProfilePicture = require("@/assets/images/default_pfp.png")
const INITIAL_PAGE_COUNT = 6

export default function Register() {
  const router = useRouter()
  const signUp = useSetAtom(signUpAtom)
  const setPageCount = useSetAtom(pageCountAtom)
  const [newUser, setNewUser] = useAtom(newUserAtom)
  const [errors, setErrors] = useAtom(authErrorsAtom)
  const timeRemaining = useAtomValue(resendTimerAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const usernameTimeout = useRef<number>(null)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const requestPhoneNumberVerification = useSetAtom(requestPhoneNumberVerificationAtom)
  const verifyPhoneNumberVerification = useSetAtom(verifyPhoneNumberVerificationAtom)
  const requestEmailVerification = useSetAtom(requestEmailVerificationAtom)
  const verifyEmailVerification = useSetAtom(verifyEmailCodeAtom)
  const verifyUserInfo = useSetAtom(verifyUserInfoAtom)
  const resetPager = useSetAtom(resetPagerAtom)
  const [avatar, setAvatar] = useState<string | null>(null)
  const skipResetOnNextBlur = useRef(false)
  const checkIfBlocked = useSetAtom(checkIfBlockedAtom)
  const isBlocked = useAtomValue(isBlockedAtom)

  // Refs for manual focus
  const phoneCodeRef = useRef<TextInput>(null!)
  const emailRef = useRef<TextInput>(null!)
  const emailCodeRef = useRef<TextInput>(null!)
  const usernameRef = useRef<TextInput>(null!)

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (skipResetOnNextBlur.current) {
          skipResetOnNextBlur.current = false
          return
        }
        resetPager()
      }
    }, [resetPager])
  )

  useEffect(() => {
    checkIfBlocked()

    // If user already has phone/email verified then skip to the appropriate page
    if (newUser.phoneVerified) {
      setCurrPage(2)
    } else if (newUser.emailVerified) {
      setCurrPage(4)
    }
  }, [])

  // Set next/back functions based on current page
  useEffect(() => {
    setPageCount(INITIAL_PAGE_COUNT)

    let nextEnabled = false
    if (currPage === 0) {
      nextEnabled = newUser.phoneNumber.length > 0 && !isBlocked
    } else if (currPage === 1) {
      nextEnabled = newUser.phoneCode.length === 6 && !isBlocked
    } else if (currPage === 2) {
      nextEnabled = newUser.email.length > 0 && !isBlocked
    } else if (currPage === 3) {
      nextEnabled = newUser.emailCode.length === 6 && !isBlocked
    } else if (currPage === 4) {
      nextEnabled =
        newUser.username.length > 0 &&
        newUser.firstName.length > 0 &&
        newUser.lastName.length > 0 &&
        newUser.locationId !== 0
    } else if (currPage === 5) {
      nextEnabled = true
    }

    setFlow({
      nextEnabled,
      back: () => {
        setCurrPage(currPage - 1)
      },
      next: () => {
        if (currPage === 0) {
          requestPhoneNumberVerification(false)
        } else if (currPage === 1) {
          verifyPhoneNumberVerification()
        } else if (currPage === 2) {
          requestEmailVerification(true, false)
        } else if (currPage === 3) {
          verifyEmailVerification(true)
        } else if (currPage === 4) {
          verifyUserInfo()
        } else if (currPage === 5) {
          signUp()
        }
      },
    })
  }, [currPage, newUser])

  // Manual focus logic
  useEffect(() => {
    if (currPage === 1 && phoneCodeRef.current) {
      setTimeout(() => phoneCodeRef.current?.focus(), 500)
    } else if (currPage === 2 && emailRef.current) {
      setTimeout(() => emailRef.current?.focus(), 500)
    } else if (currPage === 3 && emailCodeRef.current) {
      setTimeout(() => emailCodeRef.current?.focus(), 500)
    } else if (currPage === 4 && usernameRef.current) {
      setTimeout(() => usernameRef.current?.focus(), 500)
    }
  }, [currPage])

  async function handleUsername(text: string) {
    setNewUser({ ...newUser, username: text })
    setErrors({ ...errors, username: "" })
    if (usernameTimeout.current) {
      clearTimeout(usernameTimeout.current)
    }
    usernameTimeout.current = setTimeout(async () => {
      if (text.length > 0) {
        const res = await fetch(`${BASE_URL}/api/auth/username-available?username=${text}`, {
          method: "GET",
        })
        const data = await res.json()
        if (!res.ok) {
          setErrors({
            ...errors,
            username: data.errors.username,
          })
        }
      }
    }, REGISTER_USERNAME_CHECK_INTERVAL)
  }

  async function generateAvatar() {
    const res = await fetch(`${BASE_URL}/api/test`, {
      method: "GET",
    })
    const data = await res.json()
    setAvatar(data.svg.toString())
  }

  return (
    <CustomPager>
      <View style={styles.pageContainer} key="0">
        <Text style={styles.title}>Phone Number</Text>
        <PhoneNumber />
        {(errors?.phoneNumber || isBlocked) && (
          <Text style={styles.error}>{errors?.phoneNumber || <BlockedAttempts />}</Text>
        )}
        {!newUser.phoneVerified && (
          <Text style={styles.note}>We will send you a verification code.</Text>
        )}
      </View>

      <View style={styles.pageContainer} key="1">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          title="Code"
          errors={errors?.phoneVerify}
          placeholder="6-digit code"
          onChangeText={text => {
            setErrors({ ...errors, phoneVerify: "" })
            setNewUser({ ...newUser, phoneCode: text })
            setFlow({ ...flow, nextEnabled: text.length === 6 && !isBlocked })
          }}
          value={newUser.phoneCode}
          inputRef={phoneCodeRef}
          keyboardType="numeric"
          maxLength={6}
        />
        <Text style={styles.note}>Please check your email for the verification code.</Text>
        <Pressable
          onPress={() => requestPhoneNumberVerification(true)}
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
          title="Email Address"
          errors={errors?.email}
          onChangeText={text => {
            setNewUser({ ...newUser, email: text.trim().toLowerCase() })
            setErrors({ ...errors, email: "" })
          }}
          value={newUser.email}
          inputRef={emailRef}
          defaultValue={newUser.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {!newUser.emailVerified && (
          <Text style={styles.note}>We'll send you a verification code.</Text>
        )}
      </View>

      <View style={styles.pageContainer} key="3">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          title="Code"
          errors={errors?.emailVerify}
          placeholder="6-digit code"
          onChangeText={text => {
            setErrors({ ...errors, emailVerify: "" })
            setNewUser({ ...newUser, emailCode: text })
          }}
          inputRef={emailCodeRef}
          keyboardType="numeric"
          maxLength={6}
        />
        <Text style={styles.note}>Please check your email for the verification code.</Text>
        <Pressable
          onPress={() => requestEmailVerification(true, true)}
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
            Let's get to know you
          </Text>
          <CustomInput
            title="Username*"
            errors={errors?.username}
            onChangeText={handleUsername}
            defaultValue={newUser.username}
            inputRef={usernameRef}
            maxLength={20}
          />
          <CustomInput
            title="First Name*"
            errors={errors?.firstName}
            onChangeText={text => {
              setNewUser({ ...newUser, firstName: text })
              setErrors({ ...errors, firstName: "" })
            }}
            defaultValue={newUser.firstName}
          />
          <CustomInput
            title="Last Name*"
            errors={errors?.lastName}
            onChangeText={text => {
              setNewUser({ ...newUser, lastName: text })
              setErrors({ ...errors, lastName: "" })
            }}
            defaultValue={newUser.lastName}
          />
          <LocationSelector
            mandatory
            errors={errors?.location}
            onLocationChange={location => {
              setNewUser({
                ...newUser,
                locationId: location._id,
                city: location.name,
                state: location.state_name,
                country: location.country_name,
                location: location.location,
                timezone: location.timezone,
              })
              setErrors({ ...errors, location: "" })
            }}
          />
        </View>
      </ScrollView>

      <View style={styles.pageContainer} key="5">
        <Text style={styles.title}>Finally, add a picture!</Text>
        <View style={styles.containerCenter}>
          <Pressable
            onPress={() => {
              skipResetOnNextBlur.current = true
              router.push({
                pathname: "/attachment-picker",
                params: { intent: "signup" },
              })
            }}
          >
            <Image
              source={newUser.picture ? { uri: newUser.picture } : defaultProfilePicture}
              style={styles.avatar}
              contentFit="cover"
            />
            <View style={styles.avatarContainer}>
              <Feather name="edit-2" size={18} color={colors.light} />
              <Text style={styles.avatarEdit}>Edit</Text>
            </View>
          </Pressable>
          <Text style={styles.usernameDisplay}>@{newUser.username}</Text>
        </View>
      </View>
    </CustomPager>
  )
}
