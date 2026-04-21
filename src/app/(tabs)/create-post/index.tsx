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
import { useCallback, useEffect } from "react"
import { currPageAtom, flowAtom, pageCountAtom } from "@/src/store/pager-store"
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
  editedAtom,
  settingsAtom,
  initCreatePostAtom,
} from "@/src/store/create-post-store"
import { useFocusEffect } from "expo-router"
import { Question } from "@/src/types/question.types"
import Feather from "@expo/vector-icons/Feather"
import Octicons from "@expo/vector-icons/Octicons"
import { MINIMUM_SHORT_ANSWER_LENGTH } from "@/src/utils/constants"
import { errorStyles } from "@/src/styles/error.styles"
import MapSelector from "../../(util)/map-selector"
import { inputStyles } from "@/src/styles/input.styles"

export default function CreatePost() {
  const [QNAs, setQNAs] = useAtom(qnaAtom)
  const socket = useAtomValue(createPostSocketAtom)
  const loading = useAtomValue(loadingAtom)
  const setLoading = useSetAtom(loadingAtom)
  const [settings, setSettings] = useAtom(settingsAtom)
  const setFlow = useSetAtom(flowAtom)
  const [currPage, setCurrPage] = useAtom(currPageAtom)
  const forward = useSetAtom(forwardCreatePostAtom)
  const pickImage = useSetAtom(pickImageAtom)
  const setEdited = useSetAtom(editedAtom)
  const initCreatePost = useSetAtom(initCreatePostAtom)
  const pageCount = useAtomValue(pageCountAtom)

  useEffect(() => {
    if (!socket) return

    let nextEnabled = false

    // The flow is: initial question -> 0 or more questions -> extra info page -> location page -> final page
    if (currPage === 0) {
      // initial question page
      nextEnabled = QNAs[0].answer.length > 0
    } else if (currPage === pageCount - 2) {
      // location page
      nextEnabled = true
    } else if (currPage === pageCount - 1) {
      // last page
      nextEnabled = settings.title.trim().length > 0 && settings.description.trim().length > 0
    } else {
      // question pages
      if (QNAs[currPage].question.optional) {
        nextEnabled = true
      } else if (QNAs[currPage].question.type === "short_answer") {
        if (
          QNAs[currPage].answer.length === 0 ||
          QNAs[currPage].answer[0].trim().length < MINIMUM_SHORT_ANSWER_LENGTH
        ) {
          nextEnabled = false
        } else {
          nextEnabled = true
        }
      } else {
        if (QNAs[currPage].answer.length === 0) {
          nextEnabled = false
        } else {
          nextEnabled = true
        }
      }
    }

    setFlow(prev => ({
      ...prev,
      nextEnabled,
      back: () => {
        setEdited(false)
        setCurrPage(curr => curr - 1)
      },
      next: () => {
        forward()
      },
    }))
  }, [currPage, socket, settings.title, settings.description, pageCount])

  /**
   * @param questionIdx: the index of the question being answered
   * @param option: the option selected or the text inputted by the user
   * @param question: the actual question object
   */
  async function handleChange(questionIdx: number, option: string, question: Question) {
    // Set nextEnabled
    if (question.optional) {
      setFlow(prev => ({ ...prev, nextEnabled: true }))
    } else if (question.type === "short_answer" && option.length < MINIMUM_SHORT_ANSWER_LENGTH) {
      setFlow(prev => ({ ...prev, nextEnabled: false }))
    } else {
      setFlow(prev => ({ ...prev, nextEnabled: true }))
    }

    // Save the answer
    setQNAs(prev => {
      const updated = [...prev]
      if (question.type === "multiple_choice" || question.type === "short_answer") {
        updated[questionIdx].answer = [option]
      } else if (question.type === "multi_select") {
        const currentAnswers = updated[questionIdx].answer
        if (currentAnswers.includes(option)) {
          updated[questionIdx].answer = currentAnswers.filter(ans => ans !== option)
        } else {
          updated[questionIdx].answer = [...currentAnswers, option]
        }
      }
      return updated
    })

    setEdited(true)
  }

  async function refresh() {
    await initCreatePost()
  }

  function generateTitle() {
    if (socket && socket.connected) {
      setFlow(prev => ({ ...prev, nextEnabled: false }))
      setLoading(true)
      socket.emit("ai-title")
    }
  }

  useFocusEffect(
    useCallback(() => {
      refresh()
    }, [])
  )

  if (!socket || socket.connected === false) {
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.errorText}>An error occurred. Please try again.</Text>
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
                          onPress={() => handleChange(i, option, question)}
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
                          onPress={() => handleChange(i, option, question)}
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
                    onChangeText={text => handleChange(i, text, question)}
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

        <View key={QNAs.length}>
          <View style={createPostStyles.container}>
            <Text style={{ fontSize: 20, fontWeight: "600", color: colors.dark }}>
              Location (Optional)
            </Text>
            <MapSelector />
          </View>
        </View>

        {/* The last page */}
        <ScrollView
          key={QNAs.length + 1}
          style={createPostStyles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          <View style={createPostStyles.gaptainer}>
            {/* Title */}
            <View style={createPostStyles.titleInputContainer}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  title="Title"
                  headerStyles={{ fontSize: 16, fontWeight: "600" }}
                  value={settings.title}
                  onChangeText={text => setSettings({ ...settings, title: text })}
                  editable={!loading}
                  mandatory
                />
              </View>
              <Pressable onPress={generateTitle} disabled={loading} style={{ paddingBottom: 12 }}>
                <Octicons name="sparkles-fill" size={24} color={colors.purple} />
              </Pressable>
            </View>
            <CustomInput
              title="Description"
              headerStyles={{ fontSize: 16, fontWeight: "600" }}
              value={settings.description}
              multiline
              onChangeText={text => setSettings({ ...settings, description: text })}
              editable={!loading}
              mandatory
            />

            {/* Images */}
            <View>
              <Text style={inputStyles.header}>Images (Optional)</Text>

              {settings.images.length != 0 ? (
                <>
                  <ImageCarousel images={settings.images.map(img => img.localUri)} editable />
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
                    Upload Images
                  </Text>
                </Pressable>
              )}
            </View>

            {/* Other settings */}
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
            </View>
          </View>

          <View style={{ height: 200 }} />
        </ScrollView>
      </CustomPager>
    </>
  )
}
