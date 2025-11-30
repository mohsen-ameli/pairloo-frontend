import CustomInput from "@/src/components/CustomInput";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Keyboard, Text, TouchableWithoutFeedback, View } from "react-native";
import PagerView, { usePagerView } from "react-native-pager-view";
import { SafeAreaView } from "react-native-safe-area-context";
import SubmitButton from "./submit";

export default function Job() {
  const params = useLocalSearchParams<{ action?: string; category?: string }>();

  return (
    <>
      {params.action == "need" ? <Need /> : <Provide />}
      {/* <View>
        <Button
          title="Go next"
          onPress={() => {
            // setPage(1);
          }}
        ></Button>
        <Text>Current page: {}</Text>
      </View> */}
    </>
  );
}

function Need() {
  const { AnimatedPagerView, ref, setPage, activePage, ...rest } = usePagerView(
    {
      pagesAmount: 5,
    }
  );

  return (
    <PagerView
      ref={ref}
      style={{
        flex: 1,
        backgroundColor: "#e0e0e0",
      }}
      initialPage={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={{
            gap: 30,
            margin: 20,
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
            gap: 30,
            margin: 20,
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
            gap: 30,
            margin: 20,
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
            gap: 30,
            margin: 20,
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
            gap: 30,
            margin: 20,
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
    </PagerView>
  );
}

function Provide() {
  return (
    <>
      <View>
        <Text>Information</Text>
        <CustomInput placeholder="Company Name" />
        <CustomInput placeholder="Last Name" />
        <CustomInput placeholder="Email Address" />
        <CustomInput placeholder="Phone Number" />
      </View>
    </>
  );
}

export function PagerHookExample() {
  const { AnimatedPagerView, ref, ...rest } = usePagerView({ pagesAmount: 10 });

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 50,
        backgroundColor: "red",
      }}
    >
      <AnimatedPagerView
        testID="pager-view"
        ref={ref}
        style={{
          justifyContent: "center",
          alignItems: "center",
        }}
        initialPage={0}
        layoutDirection="ltr"
        overdrag={rest.overdragEnabled}
        scrollEnabled={rest.scrollEnabled}
        onPageScroll={rest.onPageScroll}
        onPageSelected={rest.onPageSelected}
        onPageScrollStateChanged={rest.onPageScrollStateChanged}
        pageMargin={10}
        orientation="horizontal"
      >
        {useMemo(
          () =>
            rest.pages.map((_, index) => (
              <View
                testID="pager-view-content"
                key={index}
                style={{
                  flex: 1,
                  backgroundColor: "#fdc08e",
                  alignItems: "center",
                  padding: 20,
                }}
                collapsable={false}
              >
                {/* <LikeCount /> */}
                <Text testID={`pageNumber${index}`}>
                  {`page number ${index}`}
                </Text>
              </View>
            )),
          [rest.pages]
        )}
      </AnimatedPagerView>
      {/* <NavigationPanel {...rest} /> */}
    </SafeAreaView>
  );
}
