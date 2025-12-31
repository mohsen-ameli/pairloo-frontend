import CustomInput from "@/src/components/CustomInput";
import useCustomPager from "@/src/components/CustomPager";
import { colors } from "@/src/utils/colors";
import { useLocalSearchParams } from "expo-router";
import {
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function Job() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();
  const { setCurrPage, setPage, Pager } = useCustomPager({
    initialPageCount: 2,
  });

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
            About You
          </Text>

          <CustomInput placeholder="Photo Upload Area" />
          <CustomInput placeholder="Height" />
          <CustomInput placeholder="Weight" />
          <CustomInput placeholder="Gender" />
          <CustomInput placeholder="Sexual Orientation" />
          <CustomInput placeholder="Hobbies" />
          <CustomInput placeholder="Education" />
          <CustomInput placeholder="Work" />
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
            About Your Partner
          </Text>

          <CustomInput placeholder="Photo Upload Area" />
          <CustomInput placeholder="Height" />
          <CustomInput placeholder="Weight" />
          <CustomInput placeholder="Gender" />
          <CustomInput placeholder="Sexual Orientation" />
          <CustomInput placeholder="Hobbies" />
          <CustomInput placeholder="Education" />
          <CustomInput placeholder="Work" />
        </View>
      </TouchableWithoutFeedback>
    </Pager>
  );
}
