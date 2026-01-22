import { atom } from "jotai"
import { userAtom } from "./auth-store"
import { WS_BASE_URL } from "@/src/utils/constants"
import { createPostSocketAtom } from "./socket-store"
import { refreshAccessToken } from "@/src/utils/refresh-access-token"
import io from "socket.io-client"
import { currPageAtom, pageCountAtom } from "./pager-store"
import { router } from "expo-router"
import { Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Question } from "@/src/types/question.types"

const INITIAL_PAGE_COUNT = 2
const DEFAULT_NUM_MATCHES = 5
const DEFAULT_PUBLIC_POST = false

const DEFAULT_QUESTION: Question = {
  type: "short_answer",
  question: "Start by describing what you want to post about.",
}

export const questionsAtom = atom<Question[]>([DEFAULT_QUESTION])
export const pagesAtom = atom([""])
export const loadingAtom = atom(false)
export const publicPostAtom = atom(DEFAULT_PUBLIC_POST)
export const numMatchesAtom = atom(DEFAULT_NUM_MATCHES)
export const imagesAtom = atom<string[]>([])
export const inputsAtom = atom<string[]>([])

export const initCreatePostAtom = atom(null, async (get, set) => {
  const user = await get(userAtom)
  if (!user) return
  if (get(createPostSocketAtom)) return

  const socket = io(WS_BASE_URL + "/create-post", {
    auth: {
      token: user.accessToken,
    },
  })

  set(createPostSocketAtom, socket)

  socket.on("connect", () => {
    console.log("Connected to WebSocket server for create-post")
  })

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server for create-post")
  })

  socket.on("error", (err: any) => {
    console.error("WebSocket error event:", err)
  })

  socket.on("connect_error", async () => {
    const accessToken = await refreshAccessToken(user.refreshToken)
    if (accessToken === null) {
      socket.disconnect()
      set(userAtom, null)
      return
    }
    await set(userAtom, { ...user, accessToken })
    socket.io.opts.auth = { token: accessToken }
    socket.connect()
  })

  socket.on("question", (question: Question) => {
    set(questionsAtom, prevQuestions => [...prevQuestions, question])
    set(pagesAtom, prevPages => [...prevPages, ""])
    set(loadingAtom, false)
    set(currPageAtom, curr => curr + 1)
    set(pageCountAtom, count => count + 1)
  })

  socket.on(
    "draft-restored",
    (data: {
      context: { question: Question; answer: string }[]
      initialPostText: string
      images: string[]
      publicPost: boolean
      numMatches: number
    }) => {
      const questions = data.context.map(item => item.question)
      const answers = data.context.map(item => item.answer)

      set(questionsAtom, [DEFAULT_QUESTION, ...questions])
      set(pagesAtom, [data.initialPostText, ...answers])
      set(inputsAtom, [data.initialPostText, ...answers])
      set(pageCountAtom, INITIAL_PAGE_COUNT + questions.length)
      set(imagesAtom, data.images)
      set(publicPostAtom, data.publicPost)
      set(numMatchesAtom, data.numMatches)

      // Navigate to the first unanswered question, or to the settings page if all answered
      const firstUnansweredIdx = answers.findIndex(answer => answer.trim() === "")
      if (firstUnansweredIdx !== -1) {
        set(currPageAtom, firstUnansweredIdx + 1)
      } else {
        set(currPageAtom, INITIAL_PAGE_COUNT + questions.length - 1)
      }

      set(loadingAtom, false)
    }
  )

  socket.on("chat-finished", () => {
    set(currPageAtom, curr => curr + 1)
    set(loadingAtom, false)
  })

  socket.on("success", (postId: string) => {
    set(questionsAtom, [DEFAULT_QUESTION])
    set(pagesAtom, [""])
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    set(numMatchesAtom, DEFAULT_NUM_MATCHES)
    set(publicPostAtom, DEFAULT_PUBLIC_POST)
    set(imagesAtom, [])
    set(inputsAtom, [])
    set(loadingAtom, false)

    router.navigate({
      pathname: "/my-posts",
      params: { redirect: `/my-posts/${postId}` },
    })
  })

  socket.on("draft-discarded", () => {
    set(questionsAtom, [DEFAULT_QUESTION])
    set(pagesAtom, [""])
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    set(numMatchesAtom, DEFAULT_NUM_MATCHES)
    set(publicPostAtom, DEFAULT_PUBLIC_POST)
    set(imagesAtom, [])
    set(inputsAtom, [])
    set(loadingAtom, false)
  })
})

export const forwardCreatePostAtom = atom(null, async (get, set) => {
  const socket = get(createPostSocketAtom)
  const currPage = get(currPageAtom)
  const inputs = get(inputsAtom)
  const publicPost = get(publicPostAtom)
  const images = get(imagesAtom)
  const numMatches = get(numMatchesAtom)
  const pageCount = get(pageCountAtom)
  const pages = get(pagesAtom)

  if (!socket) {
    console.warn("[forward] Socket is not initialized!")
    return
  }

  // If on the last page, submit
  set(loadingAtom, true)
  if (currPage === pageCount - 1) {
    socket.emit("submit", {
      numMatches,
      publicPost,
      images,
    })
    return
  }

  if (!inputs[currPage] || inputs[currPage].trim() === "") {
    Alert.alert("Input required", "Please enter some text before continuing.")
    set(loadingAtom, false)
    return
  }

  if (pages[currPage] && pages[currPage] === inputs[currPage]) {
    set(currPageAtom, currPage + 1)
    set(loadingAtom, false)
    return
  }

  socket.emit("chat", { value: inputs[currPage], questionIdx: currPage })
})

export const pickImageAtom = atom(null, async (get, set) => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()

  if (!permissionResult.granted) {
    Alert.alert("Permission required", "Permission to access the media library is required.")
    return
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images", "videos"],
    allowsMultipleSelection: true,
  })

  if (!result.canceled) {
    set(imagesAtom, prev => [...prev, ...result.assets.map(asset => asset.uri)])
  }
})

export const discardDraftAtom = atom(null, async (get, set) => {
  const socket = get(createPostSocketAtom)
  if (!socket) return

  set(loadingAtom, true)
  socket.emit("discard-draft")
})

export const saveDraftSettingsAtom = atom(
  null,
  async (
    get,
    set,
    {
      images,
      publicPost,
      numMatches,
    }: { images: string[]; publicPost: boolean; numMatches: number }
  ) => {
    const socket = get(createPostSocketAtom)
    if (!socket) return

    socket.emit("update-draft-settings", { images, publicPost, numMatches })
  }
)
