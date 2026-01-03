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
import { useAtomValue, useSetAtom } from "jotai";
import { logOutAtom, userAtom } from "@/src/utils/store";
import { WS_BASE_URL } from "@/src/utils/constants";
import { useRouter } from "expo-router";
import { refreshAccessToken } from "@/src/utils/refresh-access-token";

export default function Index() {
  const user = useAtomValue(userAtom);
  const [pages, setPages] = useState([""]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState<string[]>([""]);
  const inputRefs = useRef<string[]>([""]);
  const logout = useSetAtom(logOutAtom);
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

  async function initConnection(accessToken: string) {
    if (!user) return;

    setSocket(
      io(WS_BASE_URL + "/create-post", {
        auth: {
          token: accessToken,
        },
      })
    );
  }

  useEffect(() => {
    if (!user || !socket) return;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server for interactive embedding");
    });

    socket.on("error", (err: any) => {
      console.error("WebSocket error event:", err);
    });

    socket.on("connect_error", async () => {
      const accessToken = await refreshAccessToken(user.refreshToken);
      if (accessToken === null) {
        socket.disconnect();
        logout();
        return;
      }
      initConnection(accessToken);
    });

    socket.on("question", (question: string) => {
      setQuestions((prevQuestions) => [...prevQuestions, question]);
      setPages((prevPages) => [...prevPages, ""]);
      setLoading(false);
    });

    socket.on("finished", (postId: string) => {
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
    if (!user) return;

    initConnection("user.accessToken");
  }, [user]);

  useEffect(() => {
    setPageCount(pages.length);
    setPage(pages.length - 1);
    setCurrPage(pages.length - 1);
    setMcqAnswers((prev) => {
      if (pages.length > prev.length) {
        return [...prev, ...Array(pages.length - prev.length).fill("")];
      } else if (pages.length < prev.length) {
        return prev.slice(0, pages.length);
      }
      return prev;
    });
  }, [pages.length]);

  return (
    <>
      <CustomHeader title="Create Post" />
      <LoadingIndicator loading={loading} />

      <View style={styles.container}>
        <Pager>

          {pages.map((pageText, i) => {
            let response = null;
            try {
              response = questions[i] && questions[i].trim() !== "" ? JSON.parse(questions[i].replace(/```json|```/g, "").trim()) : null;
            } catch (e) {
              response = null;
            }
            const type = response?.type;
            const questionText = response?.question;
            const options = response?.options || [];

            console.log(questions[i]);
            

            // For multiple choice, store selected option in inputRefs.current[i] and mcqAnswers
            const handleOptionSelect = (option: string) => {
              updatePageText(i, option);
              setMcqAnswers((prev) => {
                const updated = [...prev];
                updated[i] = option;
                return updated;
              });
            };

            return (
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
                    {response && questionText
                      ? `Question: ${questionText}`
                      : "Start by describing what you want to post about."}
                  </Text>
                  {type === "multiple_choice" && options.length > 0 ? (
                    <View style={{ marginVertical: 10 }}>
                      {options.map((option: string, idx: number) => (
                        <TouchableWithoutFeedback
                          key={option}
                          onPress={() => handleOptionSelect(option)}
                        >
                          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                            <View
                              style={{
                                height: 22,
                                width: 22,
                                borderRadius: 11,
                                borderWidth: 2,
                                borderColor: colors.blue || "#007AFF",
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 10,
                              }}
                            >
                              {mcqAnswers[i] === option && (
                                <View
                                  style={{
                                    height: 12,
                                    width: 12,
                                    borderRadius: 6,
                                    backgroundColor: colors.blue || "#007AFF",
                                  }}
                                />
                              )}
                            </View>
                            <Text style={{ fontSize: 16 }}>{option}</Text>
                          </View>
                        </TouchableWithoutFeedback>
                      ))}
                    </View>
                  ) : (
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
                      multiline={type !== "multiple_choice"}
                      textAlignVertical="top"
                      scrollEnabled
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            );
          })}
          
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
