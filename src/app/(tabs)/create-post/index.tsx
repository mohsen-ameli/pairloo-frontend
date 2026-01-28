import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Switch,
  ScrollView,
  Pressable,
  Alert,
} from "react-native"
import BouncyCheckbox from "react-native-bouncy-checkbox"
import { useCallback } from "react"
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
  loadingAtom,
  pickImageAtom,
  qnaAtom,
  edittedAtom,
  settingsAtom,
} from "@/src/store/create-post-store"
import { useFocusEffect } from "expo-router"
import { Question } from "@/src/types/question.types"
import Feather from "@expo/vector-icons/Feather"

const INITIAL_PAGE_COUNT = 2

export default function CreatePost() {
  const [QNAs, setQNAs] = useAtom(qnaAtom)
  const socket = useAtomValue(createPostSocketAtom)
  const loading = useAtomValue(loadingAtom)
  const [settings, setSettings] = useAtom(settingsAtom)
  const [flow, setFlow] = useAtom(flowAtom)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const forward = useSetAtom(forwardCreatePostAtom)
  const pickImage = useSetAtom(pickImageAtom)
  const setEditted = useSetAtom(edittedAtom)

  useFocusEffect(
    useCallback(() => {
      if (!socket) return
      setFlow({
        ...flow,
        back: () => {
          setEditted(false)
          setCurrPage(currPage - 1)
        },
        next: () => {
          forward()
        },
      })
    }, [currPage, socket])
  )

  async function handleChange(i: number, option: string, type: Question["type"]) {
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
                    <Text style={{ marginBottom: 10, color: colors.dark }}>
                      Select all the options that apply:
                    </Text>
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
        <ScrollView
          key={QNAs.length}
          style={createPostStyles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={createPostStyles.gaptainer}>
            <View>
              <CustomButton onPress={pickImage} disabled={loading}>
                Choose images (optional)
              </CustomButton>
              {settings.images.length != 0 && (
                <View style={{ marginTop: 10 }}>
                  <ImageCarousel images={settings.images.map(img => img.uri)} editable />
                </View>
              )}
            </View>
            <View style={createPostStyles.gaptainer}>
              <View style={createPostStyles.lastPageRowContainer}>
                <View style={createPostStyles.lastPageRowLabelContainer}>
                  <Text style={createPostStyles.lastPageQuestion}>Public Post</Text>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Public Post",
                        "Toggle this option to make your post visible to other users.\n\nYou can change this setting anytime."
                      )
                    }
                  >
                    <Feather name="info" size={20} color={colors.gray} />
                  </Pressable>
                </View>
                <Switch
                  trackColor={{ true: colors.purple }}
                  thumbColor={colors.light}
                  onValueChange={value => setSettings({ ...settings, publicPost: value })}
                  value={settings.publicPost}
                />
              </View>
              <View style={createPostStyles.lastPageRowContainer}>
                <View style={createPostStyles.lastPageRowLabelContainer}>
                  <Text style={createPostStyles.lastPageQuestion}>Related matches</Text>
                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Related Matches",
                        "Specify how many related matches you would like to receive for this post.\n\nYou can change this setting anytime."
                      )
                    }
                  >
                    <Feather name="info" size={20} color={colors.gray} />
                  </Pressable>
                </View>
                <TextInput
                  style={createPostStyles.numMatchesInput}
                  value={settings.numMatches.toString()}
                  keyboardType="number-pad"
                  placeholder="5"
                  editable={!loading}
                  maxLength={2}
                  onChangeText={text => setSettings({ ...settings, numMatches: Number(text) })}
                />
              </View>
            </View>
          </View>

          <View style={{ height: 200 }} />
        </ScrollView>
      </CustomPager>
    </>
  )
}
