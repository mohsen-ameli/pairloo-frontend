import CustomInput from "@/src/components/CustomInput";
import { useLocalSearchParams } from "expo-router";
import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import SubmitButton from "./submit";
import useCustomPager from "@/src/components/CustomPager";
import { colors } from "@/src/utils/colors";

export default function Job() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  return <>{params.action == "need" ? <Need /> : <Provide />}</>;
}

function Need() {
  const { setCurrPage, setPage, Pager } = useCustomPager({ pageCount: 5 });

  return (
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
            alignItems: "center",
          }}
          key="1"
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            Personal Information
          </Text>
          <CustomInput placeholder="First Name" />
          <CustomInput placeholder="Last Name" />
          <CustomInput placeholder="Email Address" />
          <CustomInput placeholder="Phone Number" />
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
          key="2"
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            Education
          </Text>
          <CustomInput placeholder="School" />
          <CustomInput placeholder="Program" />
          <CustomInput placeholder="from-to" />
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
              fontWeight: "bold",
            }}
          >
            Experience
          </Text>
          <CustomInput placeholder="Company" />
          <CustomInput placeholder="Position" />
          <CustomInput placeholder="from-to" />
          <CustomInput placeholder="Description" />
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
          key="4"
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            Voluntary Disclosure
          </Text>
          <CustomInput placeholder="Gender" />
          <CustomInput placeholder="Sexual Orientation" />
          <CustomInput placeholder="Disability" />
          <CustomInput placeholder="Veteran Status" />
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
          key="5"
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            Job Preferences
          </Text>
          <CustomInput placeholder="Desired Company (or companies)" />
          <CustomInput placeholder="Desired Position" />
          <CustomInput placeholder="Desired Salary" />
          <CustomInput placeholder="Preferred Location" />
          <CustomInput placeholder="Job Type" />
          <CustomInput placeholder="Availability" />
          <SubmitButton />
        </View>
      </TouchableWithoutFeedback>
    </Pager>
  );
}

function Provide() {
  const { setCurrPage, setPage, Pager } = useCustomPager({ pageCount: 2 });

  return (
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
            alignItems: "center",
          }}
          key="1"
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            About the Company
          </Text>

          <CustomInput placeholder="Company Name" />
          <CustomInput placeholder="Last Name" />
          <CustomInput placeholder="Email Address" />
          <CustomInput placeholder="Phone Number" />
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
          key="2"
        >
          <Text
            style={{
              fontSize: 30,
              fontWeight: "bold",
            }}
          >
            About the Candidate
          </Text>

          <CustomInput placeholder="Education" />
          <CustomInput placeholder="Work background" />
          <CustomInput placeholder="University/College" />
          <CustomInput placeholder="Veteran Status" />
        </View>
      </TouchableWithoutFeedback>
    </Pager>
  );
}
