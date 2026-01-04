import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Switch,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import CustomHeader from "@/src/components/CustomHeader";
import useCustomPager from "@/src/components/CustomPager";
import { colors } from "@/src/utils/colors";
import CustomButton from "@/src/components/CustomButton";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { styles } from "@/src/styles/index.styles";
import { createPostStyles } from "@/src/styles/create_post.styles";
import io from "socket.io-client";
import { useAtomValue, useSetAtom } from "jotai";
import { logOutAtom, userAtom } from "@/src/utils/store";
import { WS_BASE_URL } from "@/src/utils/constants";
import { useFocusEffect, useRouter } from "expo-router";
import { refreshAccessToken } from "@/src/utils/refresh-access-token";
import * as ImagePicker from "expo-image-picker";
import ImageCarousel from "@/src/components/ImageCarousel";

const INITIAL_PAGE_COUNT = 2;

export default function Index() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const logout = useSetAtom(logOutAtom);
  const [pages, setPages] = useState([""]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [socket, setSocket] = useState<SocketIOClient.Socket | null>(null);
  const [loading, setLoading] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState<string[]>([""]);
  const [publicPost, setPublicPost] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const inputRefs = useRef<string[]>([""]);
  const pagesLengthRef = useRef(pages.length);
  const numMatchesRef = useRef(5);
  const { currPage, setPageCount, setPage, setCurrPage, Pager } =
    useCustomPager({
      initialPageCount: INITIAL_PAGE_COUNT,
      forwardNBackwardButtons: false,
      scrollEnabled: false,
    });

  function forward() {
    if (!socket) {
      console.warn("[forward] Socket is not initialized!");
      return;
    }

    setLoading(true);
    if (currPage == pagesLengthRef.current) {
      socket.emit("submit", {
        numMatches: numMatchesRef.current,
        publicPost,
        images,
      });
    } else if (
      !inputRefs.current[currPage] ||
      inputRefs.current[currPage].trim() === ""
    ) {
      Alert.alert(
        "Input required",
        "Please enter some text before continuing."
      );
      setLoading(false);
      return;
    } else {
      socket.emit("chat", inputRefs.current[currPage]);
    }
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

  async function pickImage() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Permission required",
        "Permission to access the media library is required."
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setImages((prev) => [
        ...prev,
        ...result.assets.map((asset) => asset.uri),
      ]);
    }
  }

  const handleOptionSelect = (i: number, option: string) => {
    inputRefs.current[i] = option;
    setMcqAnswers((prev) => {
      const updated = [...prev];
      updated[i] = option;
      return updated;
    });
  };

  useEffect(() => {
    if (!user || !socket) return;

    socket.on("connect", () => {
      console.log("Connected to WebSocket server for create-post");
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

    socket.on("chat-finished", () => {
      setPage(pagesLengthRef.current);
      setCurrPage(pagesLengthRef.current);
      setLoading(false);
    });

    socket.on("success", (postId: string) => {
      setPages([""]);
      setCurrPage(0);
      setPage(0);
      setPageCount(INITIAL_PAGE_COUNT);
      setQuestions([""]);
      inputRefs.current = [""];
      numMatchesRef.current = 5;
      setPublicPost(true);
      setImages([]);
      setLoading(false);
      setSocket(null);

      router.navigate({
        pathname: "/my-posts",
        params: { redirect: `/my-posts/${postId}` },
      });
    });
  }, [socket]);

  useFocusEffect(() => {
    if (!user) return;

    initConnection(user.accessToken);
  });

  useEffect(() => {
    pagesLengthRef.current = pages.length;
    setPageCount(pages.length + 1);
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
  }, [pages]);

  return (
    <>
      <CustomHeader title="Create Post" />
      <LoadingIndicator loading={loading} />
      <View style={styles.container}>
        <Pager>
          {pages.map((pageText, i) => {
            let response = questions[i]
              ? JSON.parse(questions[i].replace(/```json|```/g, "").trim())
              : null;
            const type = response?.type;
            const questionText = response?.question;
            const options = response?.options || [];

            return (
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                accessible={false}
                key={i}
              >
                <View style={createPostStyles.container}>
                  <Text style={createPostStyles.questionText}>
                    {response && questionText
                      ? `Question: ${questionText}`
                      : "Start by describing what you want to post about."}
                  </Text>
                  {type === "multiple_choice" && options.length > 0 ? (
                    <View style={{ marginVertical: 10 }}>
                      {options.map((option: string, idx: number) => {
                        const isSelected = mcqAnswers[i] === option;
                        return (
                          <TouchableWithoutFeedback
                            key={option}
                            onPress={() => handleOptionSelect(i, option)}
                          >
                            <View
                              style={[
                                createPostStyles.mcqOption,
                                {
                                  borderColor: isSelected
                                    ? colors.purple
                                    : colors.lightGray,
                                  backgroundColor: isSelected
                                    ? colors.lightBlue
                                    : colors.lightGray,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  createPostStyles.mcqOptionText,
                                  {
                                    color: isSelected
                                      ? colors.purple
                                      : colors.dark,
                                  },
                                ]}
                              >
                                {option}
                              </Text>
                            </View>
                          </TouchableWithoutFeedback>
                        );
                      })}
                    </View>
                  ) : (
                    <TextInput
                      style={createPostStyles.textInput}
                      defaultValue={pageText}
                      onChangeText={(text) => (inputRefs.current[i] = text)}
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

          {/* The last page */}
          <View
            key={pages.length}
            style={{
              flex: 1,
              gap: 10,
              padding: 20,
              paddingTop: 70,
              borderColor: colors.borderGray,
              borderRightWidth: 1,
            }}
          >
            <View>
              <CustomButton onPress={pickImage} disabled={loading}>
                Choose images (optional)
              </CustomButton>
              {images.length != 0 && (
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  <ImageCarousel images={images} setImages={setImages} />
                </View>
              )}
            </View>
            <View
              style={{
                marginTop: 30,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                Do you want this post to be public?
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={publicPost ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={setPublicPost}
                value={publicPost}
              />
            </View>
            <View
              style={{
                marginTop: 30,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 10,
                }}
              >
                How many related posts do you want to see?
              </Text>
              <TextInput
                style={{
                  borderColor: "gray",
                  borderWidth: 1,
                  padding: 5,
                  width: 50,
                  textAlign: "center",
                  borderRadius: 5,
                }}
                defaultValue={"5"}
                keyboardType="number-pad"
                editable={!loading}
                onChangeText={(text) =>
                  (numMatchesRef.current = parseInt(text) || 0)
                }
              />
            </View>
          </View>
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
