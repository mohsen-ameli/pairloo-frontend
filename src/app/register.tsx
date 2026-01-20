import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { Pressable, ScrollView, Text, View } from "react-native"
import CustomInput from "@/src/components/CustomInput"
import PhoneNumber from "@/src/components/phoneNumber"
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
} from "@/src/store/auth-store"
import { styles } from "@/src/styles/register.styles"
import { useEffect, useRef, useState } from "react"
import { BASE_URL, REGISTER_USERNAME_CHECK_INTERVAL } from "@/src/utils/constants"
import { currPageAtom, flowAtom } from "@/src/store/pager-store"
import CustomPager from "@/src/components/CustomPager"
import { SvgXml } from "react-native-svg"
import CustomButton from "../components/CustomButton"

const INITIAL_PAGE_COUNT = 5

export default function Register() {
  const signUp = useSetAtom(signUpAtom)
  const [newUser, setNewUser] = useAtom(newUserAtom)
  const [errors, setErrors] = useAtom(authErrorsAtom)
  const requested = useRef(false)
  const timeRemaining = useAtomValue(resendTimerAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const usernameTimeout = useRef<number>(null)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const requestPhoneNumberVerification = useSetAtom(requestPhoneNumberVerificationAtom)
  const verifyPhoneNumberVerification = useSetAtom(verifyPhoneNumberVerificationAtom)
  const requestEmailVerification = useSetAtom(requestEmailVerificationAtom)
  const verifyEmailVerification = useSetAtom(verifyEmailCodeAtom)
  const [avatar, setAvatar] = useState<string | null>(null)

  // Set next/back functions based on current page
  useEffect(() => {
    setFlow({
      ...flow,
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
          signUp()
        }
      },
    })
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
          setErrors(prev => ({
            ...prev,
            username: data.errors.username,
          }))
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

  useEffect(() => {
    generateAvatar()
  }, [])

  return (
    <CustomPager initialPageCount={INITIAL_PAGE_COUNT}>
      <View style={styles.pageContainer} key="0">
        {/* {avatar && <SvgXml xml={avatar} />}
        <CustomButton onPress={generateAvatar}>Generate Avatar</CustomButton> */}
        <Text style={styles.title}>Phone Number</Text>
        <PhoneNumber />
        {errors.phoneNumber && <Text style={styles.error}>{errors.phoneNumber}</Text>}
        {!newUser.phoneVerified && (
          <Text style={styles.note}>We will send you a verification code.</Text>
        )}
      </View>

      <View style={styles.pageContainer} key="1">
        <Text style={styles.title}>Enter Verification Code</Text>
        <CustomInput
          title="Code"
          errors={errors.phoneVerify}
          placeholder="6-digit code"
          onChangeText={text => {
            setErrors({ ...errors, phoneVerify: "" })
            setNewUser({ ...newUser, phoneCode: text })
          }}
          autoFocus
          keyboardType="numeric"
          maxLength={6}
        />
        <Text style={styles.note}>Please check your email for the verification code.</Text>
        <Pressable
          onPress={() => requestPhoneNumberVerification(true)}
          disabled={requested.current || timeRemaining > 0}
        >
          <Text
            style={[
              styles.resendText,
              {
                color: requested.current || timeRemaining > 0 ? colors.gray : colors.purple,
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
          errors={errors.email}
          onChangeText={text => {
            setNewUser({ ...newUser, email: text.trim().toLowerCase() })
            setErrors({ ...errors, email: "" })
          }}
          value={newUser.email}
          autoFocus
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
          errors={errors.emailVerify}
          placeholder="6-digit code"
          onChangeText={text => {
            setErrors({ ...errors, emailVerify: "" })
            setNewUser({ ...newUser, emailCode: text })
          }}
          autoFocus
          keyboardType="numeric"
          maxLength={6}
        />
        <Text style={styles.note}>Please check your email for the verification code.</Text>
        <Pressable
          onPress={() => requestEmailVerification(true, true)}
          disabled={requested.current || timeRemaining > 0}
        >
          <Text
            style={[
              styles.resendText,
              {
                color: requested.current || timeRemaining > 0 ? colors.gray : colors.purple,
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
            Let's get to know you!
          </Text>
          <CustomInput
            title="Username"
            errors={errors.username}
            onChangeText={handleUsername}
            defaultValue={newUser.username}
            autoFocus
          />
          <CustomInput
            title="First Name"
            errors={errors.firstName}
            onChangeText={text => {
              setNewUser({ ...newUser, firstName: text })
              setErrors({ ...errors, firstName: "" })
            }}
            defaultValue={newUser.firstName}
          />
          <CustomInput
            title="Last Name"
            errors={errors.lastName}
            onChangeText={text => {
              setNewUser({ ...newUser, lastName: text })
              setErrors({ ...errors, lastName: "" })
            }}
            defaultValue={newUser.lastName}
          />
          <LocationSelector
            onLocationChange={location => {
              setNewUser({
                ...newUser,
                locationId: location._id,
                city: location.name,
                state: location.state_name,
                country: location.country_name,
                latitude: location.latitude,
                longitude: location.longitude,
                timezone: location.timezone,
              })
            }}
          />
        </View>
      </ScrollView>
    </CustomPager>
  )
}
