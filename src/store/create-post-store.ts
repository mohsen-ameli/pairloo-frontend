import { atom } from "jotai"
import { logOutAtom, userJwtAtom } from "./auth-store"
import { WS_BASE_URL } from "@/src/utils/constants"
import { createPostSocketAtom } from "./socket-store"
import { refreshAccessToken } from "@/src/utils/refresh-access-token"
import io from "socket.io-client"
import { currPageAtom, pageCountAtom } from "./pager-store"
import { router } from "expo-router"
import { Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { QnaType, Question } from "@/src/types/question.types"
import { s3Object } from "../types/s3object.type"

const INITIAL_PAGE_COUNT = 2
const DEFAULT_NUM_MATCHES = 5
const DEFAULT_PUBLIC_POST = false

const DEFAULT_QUESTION: Question = {
  type: "short_answer",
  question: "Start by describing what you want to post about.",
}

export const qnaAtom = atom<QnaType>([{ question: DEFAULT_QUESTION, answer: [] }])
export const loadingAtom = atom(false)
export const publicPostAtom = atom(DEFAULT_PUBLIC_POST)
export const numMatchesAtom = atom(DEFAULT_NUM_MATCHES)
export const imagesAtom = atom<s3Object[]>([])
export const edittedAtom = atom(false)

export const initCreatePostAtom = atom(null, async (get, set) => {
  const user = await get(userJwtAtom)
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
      set(logOutAtom)
      return
    }
    await set(userJwtAtom, { ...user, accessToken })
    socket.io.opts.auth = { token: accessToken }
    socket.connect()
  })

  socket.on("question", (qna: QnaType) => {
    set(qnaAtom, qna)
    set(loadingAtom, false)
    set(currPageAtom, qna.length - 1)
    set(pageCountAtom, qna.length + 1)
  })

  socket.on(
    "draft-restored",
    (data: {
      qna: QnaType
      initialPostText: string
      images: s3Object[]
      publicPost: boolean
      numMatches: number
    }) => {
      set(qnaAtom, data.qna)
      set(pageCountAtom, data.qna.length + 1)
      set(imagesAtom, data.images)
      set(publicPostAtom, data.publicPost)
      set(numMatchesAtom, data.numMatches)

      // Navigate to the first unanswered question, or to the last page if all answered
      const firstUnansweredIdx = data.qna.findIndex(item => item.answer.length === 0)
      if (firstUnansweredIdx !== -1) {
        set(currPageAtom, firstUnansweredIdx)
      } else {
        set(currPageAtom, data.qna.length)
      }

      set(loadingAtom, false)
    }
  )

  socket.on("chat-finished", () => {
    set(currPageAtom, curr => curr + 1)
    set(loadingAtom, false)
  })

  socket.on("success", (postId: string) => {
    set(qnaAtom, [{ question: DEFAULT_QUESTION, answer: [] }])
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    set(numMatchesAtom, DEFAULT_NUM_MATCHES)
    set(publicPostAtom, DEFAULT_PUBLIC_POST)
    set(imagesAtom, [])
    set(loadingAtom, false)

    router.navigate({
      pathname: "/my-post",
      params: { id: postId },
    })
  })

  socket.on("draft-discarded", () => {
    set(qnaAtom, [{ question: DEFAULT_QUESTION, answer: [] }])
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    set(numMatchesAtom, DEFAULT_NUM_MATCHES)
    set(publicPostAtom, DEFAULT_PUBLIC_POST)
    set(imagesAtom, [])
    set(loadingAtom, false)
  })
})

export const forwardCreatePostAtom = atom(null, async (get, set) => {
  const qna = get(qnaAtom)
  const socket = get(createPostSocketAtom)
  const currPage = get(currPageAtom)
  const publicPost = get(publicPostAtom)
  const images = get(imagesAtom)
  const numMatches = get(numMatchesAtom)
  const pageCount = get(pageCountAtom)
  const editted = get(edittedAtom)

  if (!socket) {
    console.warn("[forward] Socket is not initialized!")
    return
  }

  // If on the last page, submit
  if (currPage === pageCount - 1) {
    set(loadingAtom, true)
    socket.emit("submit", {
      numMatches,
      publicPost,
      images,
    })
    return
  }

  if (!qna[currPage] || qna[currPage].answer.length === 0) {
    Alert.alert("Input required", "Please enter some text before continuing.")
    return
  }

  // if not changed, do nothing
  if (!editted) {
    set(currPageAtom, curr => curr + 1)
    return
  }

  set(loadingAtom, true)
  set(edittedAtom, false)
  // If user went back to change something, we need to get rid of their subsequent QAs
  // If they are just doing next normally, this will have no effect
  const qnaSlice = qna.slice(0, currPage + 1)
  socket.emit("chat", qnaSlice)
  set(qnaAtom, qnaSlice)
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
    set(imagesAtom, prev => [
      ...prev,
      ...result.assets.map(asset => ({
        localUri: asset.uri,
        key: "",
        url: "",
        createdAt: new Date().toISOString(),
      })),
    ])
  }
})

export const discardDraftAtom = atom(null, async (get, set) => {
  const socket = get(createPostSocketAtom)
  if (!socket) return

  Alert.alert("Discard Draft", "Are you sure you want to discard the current draft?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Discard",
      style: "destructive",
      onPress: () => {
        set(loadingAtom, true)
        socket.emit("discard-draft")
      },
    },
  ])
})

export const getNewQuestionAtom = atom(null, async (get, set) => {
  const socket = get(createPostSocketAtom)
  const qna = get(qnaAtom)
  const currPage = get(currPageAtom)
  if (!socket) return
  if (currPage >= qna.length) return

  {
    Alert.alert("Redo Post", "Are you sure you want to get a different question?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Redo",
        style: "default",
        onPress: () => {
          Alert.alert("NOT IMPLEMENTED")
        },
      },
    ])
  }
})

export const saveDraftSettingsAtom = atom(null, async (get, set) => {
  const socket = get(createPostSocketAtom)
  const images = get(imagesAtom)
  const publicPost = get(publicPostAtom)
  const numMatches = get(numMatchesAtom)
  if (!socket) return

  socket.emit("update-draft-settings", { images, publicPost, numMatches })
})
