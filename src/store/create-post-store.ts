import { atom } from "jotai"
import { logOutAtom, userJwtAtom } from "./auth-store"
import { MINIMUM_SHORT_ANSWER_LENGTH, WS_BASE_URL } from "@/src/utils/constants"
import { createPostSocketAtom } from "./socket-store"
import { refreshAccessToken } from "@/src/utils/refresh-access-token"
import io from "socket.io-client"
import { currPageAtom, pageCountAtom } from "./pager-store"
import { router } from "expo-router"
import { Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { QnaType, Question } from "@/src/types/question.types"
import { atomWithStorage, createJSONStorage } from "jotai/utils"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { s3Object } from "../types/s3object.type"
import { queryClientAtom } from "./general-store"

export const INITIAL_PAGE_COUNT = 2 // Starting page + last page
const DEFAULT_NUM_MATCHES = 5
const DEFAULT_PUBLIC_POST = true

const DEFAULT_QUESTION: Question = {
  type: "short_answer",
  question: "Start by describing what you are looking for.",
}

const settings = {
  images: [] as s3Object[],
  publicPost: DEFAULT_PUBLIC_POST,
  numMatches: DEFAULT_NUM_MATCHES,
}
const newUserStorage = createJSONStorage<typeof settings>(() => AsyncStorage)
export const settingsAtom = atomWithStorage("post-settings", settings, newUserStorage)

export const qnaAtom = atom<QnaType>([{ question: DEFAULT_QUESTION, answer: [] }])
export const loadingAtom = atom(false)
export const publicPostAtom = atom(DEFAULT_PUBLIC_POST)
export const numMatchesAtom = atom(DEFAULT_NUM_MATCHES)
export const imagesAtom = atom<s3Object[]>([])
export const edittedAtom = atom(false)

export const initCreatePostAtom = atom(null, async (get, set) => {
  const user = await get(userJwtAtom)
  if (!user) return
  const currSocket = get(createPostSocketAtom)
  if (currSocket && (currSocket.connected || get(loadingAtom))) return

  set(loadingAtom, true)

  const socket = io(WS_BASE_URL + "/create-post", {
    auth: {
      token: user.accessToken,
    },
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 2000,
    transports: ["websocket", "polling"],
  })

  set(createPostSocketAtom, socket)

  socket.io.on("reconnect_failed", () => {
    set(loadingAtom, false)
  })

  socket.on("connect", () => {
    console.log("Connected to WebSocket server for create-post")
    set(loadingAtom, false)
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
    set(currPageAtom, get(currPageAtom) + 1)
    set(pageCountAtom, get(pageCountAtom) + 1)
  })

  socket.on("draft-restored", (qna: QnaType) => {
    set(qnaAtom, qna)
    set(pageCountAtom, qna.length + 1)

    // Navigate to the first unanswered question, or to the last page if all answered
    const firstUnansweredIdx = qna.findIndex(item => item.answer.length === 0)
    if (firstUnansweredIdx !== -1) {
      set(currPageAtom, firstUnansweredIdx)
    } else {
      set(currPageAtom, qna.length)
    }

    set(loadingAtom, false)
  })

  socket.on("chat-finished", () => {
    set(currPageAtom, get(currPageAtom) + 1)
    set(loadingAtom, false)
  })

  socket.on("success", (postId: string) => {
    set(qnaAtom, [{ question: DEFAULT_QUESTION, answer: [] }])
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    set(settingsAtom, settings)
    set(loadingAtom, false)

    router.navigate({
      pathname: "/my-post",
      params: { id: postId },
    })
    get(queryClientAtom).invalidateQueries({ queryKey: ["my-posts"] })
  })

  socket.on("draft-discarded", () => {
    set(qnaAtom, [{ question: DEFAULT_QUESTION, answer: [] }])
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    set(settingsAtom, settings)
    set(edittedAtom, false)
    set(loadingAtom, false)
  })
})

export const forwardCreatePostAtom = atom(null, async (get, set) => {
  const qna = get(qnaAtom)
  const socket = get(createPostSocketAtom)
  const currPage = get(currPageAtom)
  const pageCount = get(pageCountAtom)
  const editted = get(edittedAtom)
  const { images, publicPost, numMatches } = await get(settingsAtom)

  if (!numMatches || numMatches < 1) {
    Alert.alert("Invalid number of matches", "Please enter a valid number of matches (1-99).")
    return
  }

  if (!socket) {
    console.warn("[forward] Socket is not initialized!")
    return
  }

  // If on the last page, submit
  if (currPage === pageCount - 1) {
    set(loadingAtom, true)
    const imagesWithFiles: { uri: string; file: Blob; mimeType: string }[] = []
    for (const img of images) {
      const response = await fetch(img.localUri)
      const blob = await response.blob()
      imagesWithFiles.push({ uri: img.localUri, file: blob, mimeType: img.mimeType })
    }
    socket.emit("submit", numMatches, publicPost, imagesWithFiles)
    return
  }

  // Validate current answer
  if (
    !qna[currPage] ||
    qna[currPage].answer.length === 0 ||
    (qna[currPage].question.type === "short_answer" &&
      qna[currPage].answer[0].length < MINIMUM_SHORT_ANSWER_LENGTH)
  ) {
    return
  }

  // if not changed, do nothing
  if (!editted) {
    set(currPageAtom, get(currPageAtom) + 1)
    return
  }

  set(loadingAtom, true)
  set(edittedAtom, false)
  // If user went back to change something, we need to get rid of their subsequent QAs
  // If they are just doing next normally, this will have no effect
  const qnaSlice = qna.slice(0, currPage + 1)
  set(qnaAtom, qnaSlice)
  set(pageCountAtom, qnaSlice.length + 1)
  socket.emit("chat", qnaSlice)
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

  const images: s3Object[] = []
  if (!result.canceled && result.assets.length > 0) {
    for (const asset of result.assets) {
      const localUri = asset.uri
      const mimeType = asset.mimeType || "image/jpeg"
      images.push({ localUri, mimeType, url: "", key: "" })
    }
    const prevSettings = await get(settingsAtom)
    await set(settingsAtom, { ...prevSettings, images })
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
    Alert.alert("Get New Question", "Are you sure you want to get a different question?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Redo",
        style: "default",
        onPress: () => {
          set(loadingAtom, true)
          const qnaSlice = qna.slice(0, currPage)
          socket.emit("chat", qnaSlice)
        },
      },
    ])
  }
})
