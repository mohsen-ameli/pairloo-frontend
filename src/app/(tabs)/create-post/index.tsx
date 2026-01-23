import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Switch,
  ScrollView,
} from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { useCallback, useEffect } from "react"
import { currPageAtom, flowAtom } from "@/src/store/pager-store"
import CustomPager from "@/src/components/CustomPager"
import { colors } from "@/src/utils/colors"
import CustomButton from "@/src/components/CustomButton"
import LoadingIndicator from "@/src/components/LoadingIndicator"
import { createPostStyles } from "@/src/styles/create-post.styles"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import ImageCarousel from "@/src/components/ImageCarousel"
import { createPostSocketAtom } from "@/src/store/socket-store"
import {
  forwardCreatePostAtom,
  imagesAtom,
  loadingAtom,
  numMatchesAtom,
  pickImageAtom,
  publicPostAtom,
  saveDraftSettingsAtom,
  qnaAtom,
  edittedAtom,
} from "@/src/store/create-post-store"
import { useFocusEffect } from "expo-router"
import { Question } from "@/src/types/question.types"
import useGradualAnimation from "@/src/utils/gradual-animation"

const INITIAL_PAGE_COUNT = 2

export default function CreatePost() {
  const [QNAs, setQNAs] = useAtom(qnaAtom)
  const socket = useAtomValue(createPostSocketAtom)
  const loading = useAtomValue(loadingAtom)
  const [publicPost, setPublicPost] = useAtom(publicPostAtom)
  const [images, setImages] = useAtom(imagesAtom)
  const [numMatches, setNumMatches] = useAtom(numMatchesAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const forward = useSetAtom(forwardCreatePostAtom)
  const pickImage = useSetAtom(pickImageAtom)
  const saveDraftSettings = useSetAtom(saveDraftSettingsAtom)
  const setEditted = useSetAtom(edittedAtom)
  const { height } = useGradualAnimation({ isAuthenticated: true })

  const fakeView = useAnimatedStyle(() => {
    return {
      height: Math.abs(height.value),
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!socket) return
      setFlow({
        ...flow,
        back: () => {
          setCurrPage(currPage - 1)
        },
        next: () => {
          forward()
        },
      })
    }, [currPage, socket])
  )

  useEffect(() => {
    saveDraftSettings()
  }, [images, publicPost, numMatches, saveDraftSettings])

  async function handleChange(i: number, option: string, type: Question["type"]) {
    // await new Promise(resolve => setTimeout(resolve, 1000)) // wait for next tick
    setQNAs(prev => {
      const updated = [...prev]
      if (type === "multiple_choice" || type === "short_answer") {
        updated[i].answer = [option]
      } else if (type === "multi_select") {
        const currentAnswers = updated[i].answer
        if (currentAnswers.includes(option)) {
          updated[i].answer = currentAnswers.filter(ans => ans !== option)
        } else {
          updated[i].answer = [...currentAnswers, option]
        }
      }
      return updated
    })
    setEditted(true)
  }

  return (
    <>
      <LoadingIndicator loading={loading} opacity={0.5} />

      <CustomPager initialPageCount={INITIAL_PAGE_COUNT}>
        {QNAs.map((qna, i) => {
          const question = qna.question
          const answer = qna.answer
          const type = question.type
          const questionText = question.question
          const options = question.options

          return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} key={i}>
              <View style={createPostStyles.container}>
                <Text style={createPostStyles.questionText}>{questionText}</Text>
                {type === "multiple_choice" && options && options.length > 0 ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {options.map((option: string, idx: number) => {
                      const isSelected = answer.includes(option)
                      return (
                        <TouchableWithoutFeedback
                          key={option}
                          onPress={() => handleChange(i, option, type)}
                        >
                          <View
                            style={[
                              createPostStyles.mcqOption,
                              {
                                borderColor: isSelected ? colors.purple : colors.lightGray,
                                backgroundColor: isSelected ? colors.lightPurple : colors.lightGray,
                              },
                            ]}
                          >
                            <Text style={[createPostStyles.mcqOptionText, { color: colors.dark }]}>
                              {option}
                            </Text>
                          </View>
                        </TouchableWithoutFeedback>
                      )
                    })}
                  </ScrollView>
                ) : type === "multi_select" && options && options.length > 0 ? (
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={{ marginBottom: 10 }}>Select all the options that apply:</Text>
                    {options.map((option: string, idx: number) => {
                      const isSelected = answer.includes(option)
                      return (
                        <View
                          key={option}
                          style={[
                            createPostStyles.multiSelect,
                            {
                              borderColor: isSelected ? colors.purple : colors.lightGray,
                              backgroundColor: isSelected ? colors.lightPurple : colors.lightGray,
                            },
                          ]}
                        >
                          <BouncyCheckbox
                            isChecked={isSelected}
                            onPress={() => handleChange(i, option, type)}
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
                              color: colors.dark,
                              textDecorationLine: "none",
                            }}
                          />
                        </View>
                      )
                    })}
                  </ScrollView>
                ) : (
                  <TextInput
                    style={createPostStyles.textInput}
                    placeholderTextColor={colors.gray}
                    defaultValue={qna.answer[0]}
                    value={qna.answer[0]}
                    onChangeText={text => handleChange(i, text, type)}
                    placeholder="Write as little or as much details as you want..."
                    editable={!loading}
                    multiline
                    numberOfLines={10}
                    textAlignVertical="top"
                    scrollEnabled
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          )
        })}

        {/* The last page */}
        <View key={QNAs.length} style={{ flex: 1 }}>
          <ScrollView style={createPostStyles.scrollView} keyboardShouldPersistTaps="handled">
            <View style={{ gap: 10 }}>
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
                  trackColor={{ true: colors.purple }}
                  ios_backgroundColor={colors.light}
                  onValueChange={setPublicPost}
                  value={publicPost}
                />
              </View>
              <View
                style={{
                  marginTop: 30,
                  paddingBottom: 80,
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
                  style={createPostStyles.numMatchesInput}
                  value={numMatches.toString()}
                  keyboardType="number-pad"
                  editable={!loading}
                  onChangeText={text => setNumMatches(parseInt(text) || 0)}
                />
              </View>
            </View>
          </ScrollView>

          <Animated.View style={[fakeView, { backgroundColor: colors.light }]} />
        </View>
      </CustomPager>
    </>
  )
}
