import { useRouter } from "expo-router";
import { useAtom } from "jotai";
import {
  Alert,
  Keyboard,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import CustomButton from "../components/CustomButton";
import CustomInput from "../components/CustomInput";
import PhoneNumber from "../components/phoneNumber";
import { colors } from "../utils/colors";
import { newUserAtom, signUpAtom, signUpErrorsAtom } from "../utils/store";
import useCustomPager from "../components/CustomPager";

export default function Register() {
  const { setCurrPage, setPage, Pager } = useCustomPager({
    initialPageCount: 4,
  });
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
      <Pager>
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
            <CustomButton onPress={signUpHandler}>Create account</CustomButton>
          </View>
        </TouchableWithoutFeedback>
      </Pager>
    </>
  );
}
