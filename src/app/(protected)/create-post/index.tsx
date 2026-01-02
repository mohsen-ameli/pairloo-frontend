import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import CustomHeader from "@/src/components/CustomHeader";
import useCustomPager from "@/src/components/CustomPager";
import { colors } from "@/src/utils/colors";
import CustomButton from "@/src/components/CustomButton";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { styles } from "@/src/styles/index.styles";
import io from "socket.io-client";
import { useAtomValue } from "jotai";
import { userAtom } from "@/src/utils/store";
import { WS_BASE_URL } from "@/src/utils/constants";
import { useRouter } from "expo-router";

export default function Index() {
  const user = useAtomValue(userAtom);
  const [pages, setPages] = useState([""]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<string[]>([""]);
  const { currPage, setPageCount, setPage, setCurrPage, Pager } =
    useCustomPager({
      initialPageCount: 1,
      forwardNBackwardButtons: false,
    });
  const router = useRouter();

  function forward() {
    if (!socket) {
      console.warn("[forward] Socket is not initialized!");
      return;
    }
    setLoading(true);
    socket.emit("chat", inputRefs.current[currPage]);
  }

  function updatePageText(index: number, text: string) {
    inputRefs.current[index] = text;
  }

  function initConnection() {
    if (!user) return;
    setSocket(
      io(WS_BASE_URL + "/create-post", {
        auth: {
          token: user.accessToken,
        },
      })
    );
  }

  useEffect(() => {
    socket?.on("connect", () => {
      console.log("Connected to WebSocket server for interactive embedding");
    });

    socket?.on("error", (err: any) => {
      console.error("WebSocket error event:", err);
    });

    socket?.on("question", (question: string) => {
      setQuestions((prevQuestions) => [...prevQuestions, question]);
      setPages((prevPages) => [...prevPages, ""]);
      setLoading(false);
    });

    socket?.on("finished", (postId: string) => {
      setPages([""]);
      setCurrPage(0);
      setPage(0);
      setPageCount(1);
      setQuestions([""]);
      inputRefs.current = [""];
      setLoading(false);
      router.navigate({
        pathname: "/my-posts",
        params: { redirect: `/my-posts/${postId}` },
      });
    });
  }, [socket]);

  useEffect(() => {
    initConnection();
  }, [user]);

  useEffect(() => {
    setPageCount(pages.length);
    setPage(pages.length - 1);
    setCurrPage(pages.length - 1);
  }, [pages.length]);

  return (
    <>
      <CustomHeader title="Create Post" />
      <LoadingIndicator loading={loading} />

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
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    marginBottom: 10,
                  }}
                >
                  {questions[i]
                    ? `Question: ${questions[i]}`
                    : "Start by describing what you want to post about."}
                </Text>
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
                  defaultValue={pageText}
                  onChangeText={(text) => updatePageText(i, text)}
                  placeholder={
                    "Write as little or as much details as you want..."
                  }
                  editable={!loading}
                  multiline
                  textAlignVertical="top"
                  scrollEnabled
                />
              </View>
            </TouchableWithoutFeedback>
          ))}
        </Pager>

        <View style={{ margin: 20 }}>
          <CustomButton onPress={forward} disabled={loading}>
            Continue
          </CustomButton>
        </View>
      </View>
    </>
  );
}
