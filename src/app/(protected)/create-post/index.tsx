import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import React, { useRef, useState } from "react";
import CustomHeader from "@/src/components/CustomHeader";
import useCustomPager from "@/src/components/CustomPager";
import { colors } from "@/src/utils/colors";
import CustomButton from "@/src/components/CustomButton";
import { styles } from "@/src/styles/index.styles";

export default function Index() {
  const [pages, setPages] = useState([""]);
  const inputRefs = useRef<string[]>([""]);
  const { setPageCount, Pager } = useCustomPager({
    initialPageCount: 1,
    forwardNBackwardButtons: false,
  });

  function forward() {
    // fetch question, if no question then show summary and ask for "how many related posts to show?"
    // and "Is this a public or private post?"
    setPages((prev) => [...prev, ""]);
    setPageCount(pages.length + 1);
  }

  function updatePageText(index: number, text: string) {
    inputRefs.current[index] = text;
  }

  return (
    <>
      <CustomHeader title="Create Post" />

      <View style={styles.container}>
        <Pager>
          {pages.map((pageText, i) => (
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
              key={i}
            >
              <View
                style={{
                  flex: 1,
                  gap: 10,
                  padding: 20,
                  paddingTop: 70,
                  borderColor: colors.borderGray,
                  borderRightWidth: 1,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    borderColor: "gray",
                    borderWidth: 1,
                    margin: 10,
                    marginBottom: 120,
                    padding: 10,
                    textAlignVertical: "top",
                    borderRadius: 5,
                  }}
                  value={pageText}
                  onChangeText={(text) => updatePageText(i, text)}
                  placeholder={`Write your post for page ${i + 1}...`}
                />
              </View>
            </TouchableWithoutFeedback>
          ))}
        </Pager>

        <View style={{ margin: 20 }}>
          <CustomButton onPress={forward}>Continue</CustomButton>
        </View>
      </View>
    </>
  );
}
