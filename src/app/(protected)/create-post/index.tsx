import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Switch,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import React, { useCallback, useState, useEffect } from "react"
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
  inputsAtom,
  loadingAtom,
  numMatchesAtom,
  pagesAtom,
  pickImageAtom,
  publicPostAtom,
  questionsAtom,
  discardDraftAtom,
  saveDraftSettingsAtom,
  saveDraftStateAtom,
} from "@/src/store/create-post-store"
import { useFocusEffect } from "expo-router"

const INITIAL_PAGE_COUNT = 2

export default function CreatePost() {
  const pages = useAtomValue(pagesAtom)
  const questions = useAtomValue(questionsAtom)
  const socket = useAtomValue(createPostSocketAtom)
  const loading = useAtomValue(loadingAtom)
  const [mcqAnswers, setMcqAnswers] = useState<string[]>([""])
  const [multiSelectAnswers, setMultiSelectAnswers] = useState<string[][]>([[]])
  const [publicPost, setPublicPost] = useAtom(publicPostAtom)
  const [images, setImages] = useAtom(imagesAtom)
  const [inputs, setInputs] = useAtom(inputsAtom)
  const [numMatches, setNumMatches] = useAtom(numMatchesAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const forward = useSetAtom(forwardCreatePostAtom)
  const pickImage = useSetAtom(pickImageAtom)
  const discardDraft = useSetAtom(discardDraftAtom)
  const saveDraftSettings = useSetAtom(saveDraftSettingsAtom)
  const saveDraftState = useSetAtom(saveDraftStateAtom)

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
    const newMcqAnswers: string[] = []
    const newMultiSelectAnswers: string[][] = []

    questions.forEach((question, i) => {
      if (question.type === "multiple_choice") {
        newMcqAnswers[i] = inputs[i] || ""
      } else if (question.type === "multi_select") {
        newMultiSelectAnswers[i] = inputs[i] ? inputs[i].split(", ").filter(s => s) : []
      }
    })

    setMcqAnswers(newMcqAnswers)
    setMultiSelectAnswers(newMultiSelectAnswers)
  }, [questions, inputs])

  useEffect(() => {
    saveDraftSettings({ images, publicPost, numMatches })
  }, [images, publicPost, numMatches, saveDraftSettings])

  useEffect(() => {
    saveDraftState({ inputs, currPage })
  }, [inputs, currPage, saveDraftState])

  const handleOptionSelect = (i: number, option: string) => {
    setInputs(prev => {
      const updated = [...prev]
      updated[i] = option
      return updated
    })
    setMcqAnswers(prev => {
      const updated = [...prev]
      updated[i] = option
      return updated
    })
  }

  const handleMultiSelectOption = (i: number, option: string) => {
    setMultiSelectAnswers(prev => {
      const updated = [...prev]
      const selected = updated[i] || []
      if (selected.includes(option)) {
        updated[i] = selected.filter(o => o !== option)
      } else {
        updated[i] = [...selected, option]
      }
      setInputs(prev => {
        const updatedInputs = [...prev]
        updatedInputs[i] = updated[i].join(", ")
        return updatedInputs
      })
      return updated
    })
  }

  return (
    <>
      <LoadingIndicator loading={loading} />

      <CustomPager initialPageCount={INITIAL_PAGE_COUNT}>
        {pages.map((pageText, i) => {
          const question = questions[i]
          const type = question.type
          const questionText = question.question
          const options = question.options

          return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false} key={i}>
              <View style={createPostStyles.container}>
                <Text style={createPostStyles.questionText}>
                  {questions.length === 1 ? questionText : `Question: ${questionText}`}
                </Text>
                {pages.length > 1 && (
                  <Pressable
                    onPress={discardDraft}
                    disabled={loading}
                    style={createPostStyles.discardButton}
                  >
                    <Text style={createPostStyles.discardButtonText}>Discard Draft & Restart</Text>
                  </Pressable>
                )}
                {type === "multiple_choice" && options && options.length > 0 ? (
                  <View style={{ marginVertical: 10, paddingBottom: 80 }}>
                    {options.map((option: string, idx: number) => {
                      const isSelected = mcqAnswers[i] === option
                      return (
                        <TouchableWithoutFeedback
                          key={option}
                          onPress={() => handleOptionSelect(i, option)}
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
                            <Text
                              style={[
                                createPostStyles.mcqOptionText,
                                {
                                  color: colors.dark,
                                },
                              ]}
                            >
                              {option}
                            </Text>
                          </View>
                        </TouchableWithoutFeedback>
                      )
                    })}
                  </View>
                ) : type === "multi_select" && options && options.length > 0 ? (
                  <ScrollView
                    style={{ marginVertical: 10, paddingBottom: 80 }}
                    scrollEnabled={true}
                  >
                    <Text style={{ marginBottom: 10 }}>Select all the options that apply:</Text>
                    {options.map((option: string, idx: number) => {
                      const selectedOptions = multiSelectAnswers[i] || []
                      const isSelected = selectedOptions.includes(option)
                      return (
                        <View
                          key={option}
                          style={[
                            createPostStyles.multiSelect,
                            {
                              backgroundColor: isSelected ? colors.lightPurple : colors.lightGray,
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
                      )
                    })}
                  </ScrollView>
                ) : (
                  <TextInput
                    style={createPostStyles.textInput}
                    placeholderTextColor={colors.gray}
                    defaultValue={pageText}
                    value={inputs[i]}
                    onChangeText={text => {
                      setInputs(prev => {
                        const updated = [...prev]
                        updated[i] = text
                        return updated
                      })
                    }}
                    placeholder="Write as little or as much details as you want..."
                    editable={!loading}
                    multiline={type !== "multiple_choice"}
                    textAlignVertical="top"
                    scrollEnabled
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          )
        })}

        {/* The last page */}
        <KeyboardAvoidingView
          key={pages.length}
          behavior="padding"
          style={{
            flex: 1,
          }}
        >
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
        </KeyboardAvoidingView>
      </CustomPager>
    </>
  )
}
