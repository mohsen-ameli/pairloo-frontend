import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Switch,
  Alert,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import React, { useCallback, useEffect, useRef, useState } from "react";
import CustomHeader from "@/src/components/CustomHeader";
import useCustomPager, { flowAtom } from "@/src/components/CustomPager";
import { colors } from "@/src/utils/colors";
import CustomButton from "@/src/components/CustomButton";
import LoadingIndicator from "@/src/components/LoadingIndicator";
import { createPostStyles } from "@/src/styles/create_post.styles";
import io from "socket.io-client";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { logOutAtom, userAtom } from "@/src/utils/store";
import { WS_BASE_URL } from "@/src/utils/constants";
import { useRouter } from "expo-router";
import { refreshAccessToken } from "@/src/utils/refresh-access-token";
import * as ImagePicker from "expo-image-picker";
import ImageCarousel from "@/src/components/ImageCarousel";
import { useQueryClient } from "@tanstack/react-query";
import { useAtomCallback } from "jotai/utils";
import { createPostSocketAtom } from "@/src/utils/socket-store";

const INITIAL_PAGE_COUNT = 2;

export default function Index() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAtomValue(userAtom);
  const logout = useSetAtom(logOutAtom);
  const [pages, setPages] = useState([""]);
  const [questions, setQuestions] = useState<string[]>([""]);
  const [socket, setSocket] = useAtom(createPostSocketAtom);
  const [loading, setLoading] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState<string[]>([""]);
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[][]>([
    [],
  ]);
  const [publicPost, setPublicPost] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const inputRefs = useRef<string[]>([""]);
  const pagesLengthRef = useRef(pages.length);
  const numMatchesRef = useRef(5);
  const [flow, setFlow] = useAtom(flowAtom);
  const { currPage, setPageCount, setPage, setCurrPage, Pager } =
    useCustomPager({ initialPageCount: INITIAL_PAGE_COUNT });

  useEffect(() => {
    setFlow({
      ...flow,
      back: () => {
        setCurrPage(currPage - 1);
        setPage(currPage - 1);
      },
      next: () => {
        forward();
      },
    });

    return () => {
      setFlow({
        back: null,
        next: null,
        backEnabled: true,
        nextEnabled: true,
      });
    };
  }, [currPage]);

  const forward = useAtomCallback(
    useCallback(
      (get) => {
        const s = get(createPostSocketAtom);
        if (!s) {
          console.warn("[forward] Socket is not initialized!");
          return;
        }

        setLoading(true);
        if (currPage == pagesLengthRef.current) {
          s.emit("submit", {
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
          s.emit("chat", inputRefs.current[currPage]);
        }
      },
      [currPage, publicPost, images]
    )
  );

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

  const handleMultiSelectOption = (i: number, option: string) => {
    setMultiSelectAnswers((prev) => {
      const updated = [...prev];
      const selected = updated[i] || [];
      if (selected.includes(option)) {
        updated[i] = selected.filter((o) => o !== option);
      } else {
        updated[i] = [...selected, option];
      }
      inputRefs.current[i] = updated[i].join(", ");
      return updated;
    });
  };

  useEffect(() => {
    if (!user) return;
    if (!socket) {
      initConnection(user.accessToken);
      return;
    }

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
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    });
  }, [socket, user]);

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
    setMultiSelectAnswers((prev) => {
      if (pages.length > prev.length) {
        return [...prev, ...Array(pages.length - prev.length).fill([])];
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
                ) : type === "multi_select" && options.length > 0 ? (
                  <View style={{ marginVertical: 10 }}>
                    <Text style={{ marginBottom: 10 }}>
                      Select all the options that apply:
                    </Text>
                    {options.map((option: string, idx: number) => {
                      const selectedOptions = multiSelectAnswers[i] || [];
                      const isSelected = selectedOptions.includes(option);
                      return (
                        <View
                          key={option}
                          style={[
                            createPostStyles.multiSelect,
                            {
                              backgroundColor: isSelected
                                ? colors.lightBlue
                                : colors.lightGray,
                            },
                          ]}
                        >
                          <BouncyCheckbox
                            isChecked={isSelected}
                            onPress={() => handleMultiSelectOption(i, option)}
                            fillColor={colors.purple}
                            iconStyle={{
                              borderColor: colors.dark,
                              borderRadius: 2,
                            }}
                            innerIconStyle={{
                              borderWidth: 2,
                              borderRadius: 5,
                            }}
                            style={{ marginRight: 5 }}
                            text={option}
                            textStyle={{
                              ...createPostStyles.mcqOptionText,
                              color: isSelected ? colors.purple : colors.dark,
                              textDecorationLine: "none",
                            }}
                          />
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <TextInput
                    style={createPostStyles.textInput}
                    placeholderTextColor={colors.gray}
                    defaultValue={pageText}
                    onChangeText={(text) => (inputRefs.current[i] = text)}
                    placeholder="Write as little or as much details as you want..."
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
                color: colors.dark,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              Do you want this post to be public?
            </Text>
            <Switch
              trackColor={{ false: colors.gray, true: colors.purple }}
              thumbColor={publicPost ? colors.light : colors.dark}
              ios_backgroundColor={colors.light}
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
                color: colors.dark,
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 10,
              }}
            >
              How many related posts do you want to see?
            </Text>
            <TextInput
              style={{
                color: colors.dark,
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
    </>
  );
}
