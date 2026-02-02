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
import CustomInput from "@/src/components/CustomInput"
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
  initCreatePostAtom,
} from "@/src/store/create-post-store"
import { useFocusEffect } from "expo-router"
import { Question } from "@/src/types/question.types"
import Feather from "@expo/vector-icons/Feather"
import { MINIMUM_SHORT_ANSWER_LENGTH } from "@/src/utils/constants"
import { errorStyles } from "@/src/styles/error.styles"

export default function CreatePost() {
  const [QNAs, setQNAs] = useAtom(qnaAtom)
  const socket = useAtomValue(createPostSocketAtom)
  const loading = useAtomValue(loadingAtom)
  const [settings, setSettings] = useAtom(settingsAtom)
  const setFlow = useSetAtom(flowAtom)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const forward = useSetAtom(forwardCreatePostAtom)
  const pickImage = useSetAtom(pickImageAtom)
  const setEditted = useSetAtom(edittedAtom)
  const initCreatePost = useSetAtom(initCreatePostAtom)

  useFocusEffect(
    useCallback(() => {
      if (!socket) return
      setFlow({
        nextEnabled: currPage < QNAs.length ? QNAs[currPage].answer.length > 0 : true,
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
    if (type === "short_answer" && option.length < MINIMUM_SHORT_ANSWER_LENGTH) {
      setFlow(prev => ({ ...prev, nextEnabled: false }))
    } else {
      setFlow(prev => ({ ...prev, nextEnabled: true }))
    }
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

  async function refresh() {
    await initCreatePost()
  }

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [])
  )

  if (!socket || socket.connected === false) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.errorText}>An error occured. Please try again.</Text>
        <Pressable style={errorStyles.retryButton} onPress={refresh}>
          <Text style={errorStyles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <>
      <LoadingIndicator loading={loading} opacity={0.5} />

      <CustomPager>
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
                        <BouncyCheckbox
                          key={option}
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
                          style={[
                            createPostStyles.multiSelect,
                            {
                              borderColor: isSelected ? colors.purple : colors.lightGray,
                              backgroundColor: isSelected ? colors.lightPurple : colors.lightGray,
                            },
                          ]}
                          text={option}
                          textStyle={{
                            ...createPostStyles.mcqOptionText,
                            color: colors.dark,
                            textDecorationLine: "none",
                          }}
                        />
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
                    placeholder="Write as little or as much details as you want"
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
              <CustomInput
                title="Title"
                value={settings.title}
                onChangeText={text => setSettings({ ...settings, title: text })}
                editable={!loading}
                mandatory
              />
            </View>
            <View>
              {settings.images.length != 0 ? (
                <>
                  <ImageCarousel images={settings.images} isLocalUri editable />
                  <Pressable
                    onPress={pickImage}
                    disabled={loading}
                    style={createPostStyles.addMoreImagesButton}
                  >
                    <Feather name="plus" size={24} color={colors.purple} />
                    <Text style={{ color: colors.purple, fontSize: 16, fontWeight: "500" }}>
                      Add More Images
                    </Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  onPress={pickImage}
                  disabled={loading}
                  style={createPostStyles.uploadImageButton}
                >
                  <Feather name="upload" size={40} color={colors.purple} />
                  <Text style={{ marginTop: 10, color: colors.dark, fontSize: 16 }}>
                    Upload Images (Optional)
                  </Text>
                </Pressable>
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
