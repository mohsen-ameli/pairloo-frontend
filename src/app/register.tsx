import { useRouter } from "expo-router";
import { useAtom, useAtomValue } from "jotai";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Keyboard,
  Pressable,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import PagerView, { usePagerView } from "react-native-pager-view";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import PhoneNumber from "../components/phoneNumber";
import { colors } from "../utils/colors";
import {
  newUserAtom,
  signUpAtom,
  signUpErrorsAtom,
  userAtom,
} from "../utils/store";

const PAGE_COUNT = 4;

export default function Register() {
  const [currPage, setCurrPage] = useState(0);
  const scrollOffset = useRef(new Animated.Value(0)).current;
  const { AnimatedPagerView, ref, setPage, activePage, ...rest } = usePagerView(
    {
      pagesAmount: PAGE_COUNT,
    }
  );
  const user = useAtomValue(userAtom);
  const [newUser, setNewUser] = useAtom(newUserAtom);
  const [errors, setErrors] = useAtom(signUpErrorsAtom);
  const signUp = useAtom(signUpAtom)[1];
  const router = useRouter();

  function handleErrors() {
    if (errors.phoneNumber) {
      setCurrPage(0);
      setPage(0);
    } else if (errors.email) {
      setCurrPage(1);
      setPage(1);
    } else if (errors.username || errors.firstName || errors.lastName) {
      setCurrPage(2);
      setPage(2);
    } else if (errors.country || errors.city) {
      setCurrPage(3);
      setPage(3);
    } else if (errors.general) {
      Alert.alert("Error", errors.general);
    }
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

  return (
    <>
      {/* Dots */}
      <View
        style={{
          position: "absolute",
          top: 10,
          left: 10,
          padding: 30,
          width: "95%",
          zIndex: 1,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {[...Array(PAGE_COUNT)].map((_, i) => {
            const inputRange = [i - 1, i, i + 1];
            const scale = scrollOffset.interpolate({
              inputRange,
              outputRange: [1, 1.75, 1],
              extrapolate: "clamp",
            });
            const opacity = scrollOffset.interpolate({
              inputRange,
              outputRange: [0.5, 1, 0.5],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: colors.purple,
                  marginHorizontal: 2,
                  transform: [{ scale }],
                  opacity,
                }}
              />
            );
          })}
        </View>
      </View>

      {/* Forward and Backward */}
      <View
        style={{
          position: "absolute",
          bottom: 50,
          left: 20,
          right: 20,
          flexDirection: "row",
          justifyContent: "space-between",
          zIndex: 1,
        }}
      >
        {currPage > 0 ? (
          <Pressable
            style={{
              width: 70,
              height: 70,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.purple,
              borderRadius: "50%",
            }}
            onPress={() => {
              setCurrPage(currPage - 1);
              setPage(currPage - 1);
            }}
          >
            <Text
              style={{
                color: colors.light,
                fontSize: 16,
              }}
            >
              Back
            </Text>
            {/* <Feather name="arrow-left" size={30} color={colors.light} /> */}
          </Pressable>
        ) : (
          <View />
        )}
        {currPage < PAGE_COUNT - 1 ? (
          <Pressable
            style={{
              width: 70,
              height: 70,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.purple,
              borderRadius: "50%",
            }}
            onPress={() => {
              setCurrPage(currPage + 1);
              setPage(currPage + 1);
            }}
          >
            <Text
              style={{
                color: colors.light,
                fontSize: 16,
              }}
            >
              Next
            </Text>
            {/* <Feather name="arrow-right" size={30} color={colors.light} /> */}
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      {/* Pages */}
      <PagerView
        ref={ref}
        style={{
          flex: 1,
          backgroundColor: "#e0e0e0",
        }}
        initialPage={0}
        onPageScroll={(e) => {
          // e.nativeEvent.offset is 0-1 between pages, position is the left page index
          const position = e.nativeEvent.position;
          const offset = e.nativeEvent.offset;
          // Animate scrollOffset to current page + offset
          Animated.timing(scrollOffset, {
            toValue: position + offset,
            duration: 0,
            useNativeDriver: false,
          }).start();
        }}
        onPageSelected={(e) => {
          setCurrPage(e.nativeEvent.position);
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              gap: 10,
              padding: 20,
              paddingTop: 100,
              borderColor: colors.borderGray,
              borderRightWidth: 1,
            }}
            key="1"
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
                marginBottom: 20,
                alignSelf: "center",
              }}
            >
              Phone Number
            </Text>
            <PhoneNumber />
            {errors.phoneNumber && (
              <Text
                style={{
                  color: "tomato",
                }}
              >
                {errors.phoneNumber}
              </Text>
            )}
            <Text>We'll send you a verification code.</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              gap: 10,
              padding: 20,
              paddingTop: 100,
              borderColor: colors.borderGray,
              borderRightWidth: 1,
            }}
            key="2"
          >
            <Text
              style={{
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
                setNewUser({ ...newUser, email: text });
                setErrors({ ...errors, email: "" });
              }}
              defaultValue={newUser.email}
              placeholder="Email Address"
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
            <Text>We'll send you a verification code.</Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={{
              flex: 1,
              gap: 10,
              padding: 20,
              paddingTop: 100,
              borderColor: colors.borderGray,
              borderRightWidth: 1,
              alignItems: "center",
            }}
            key="3"
          >
            <Text
              style={{
                fontSize: 30,
                marginBottom: 20,
                fontWeight: "bold",
                alignSelf: "center",
              }}
            >
              Let's get to know you!
            </Text>
            <CustomInput
              onChangeText={(text) => {
                setNewUser({ ...newUser, username: text });
                setErrors({ ...errors, username: "" });
              }}
              defaultValue={newUser.username}
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
          <View
            style={{
              flex: 1,
              gap: 30,
              padding: 20,
              paddingTop: 100,
              borderColor: colors.borderGray,
              borderRightWidth: 1,
              alignItems: "center",
            }}
            key="4"
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "bold",
              }}
            >
              Where are you based?
            </Text>
            <CustomInput
              onChangeText={(text) => {
                setNewUser({ ...newUser, country: text });
                setErrors({ ...errors, country: "" });
              }}
              defaultValue={newUser.country}
              placeholder="Country"
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
            <CustomInput
              onChangeText={(text) => {
                setNewUser({ ...newUser, city: text });
                setErrors({ ...errors, city: "" });
              }}
              defaultValue={newUser.city}
              placeholder="City"
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
            <CustomButton text="Create account" onPress={signUpHandler} />
          </View>
        </TouchableWithoutFeedback>
      </PagerView>
    </>
  );
}
