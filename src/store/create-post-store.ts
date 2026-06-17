import { atom } from "jotai"
import { refreshTokensAtom, userSecureAtom } from "./auth-store"
import { MAX_POST_IMAGES, MINIMUM_SHORT_ANSWER_LENGTH, WS_BASE_URL } from "@/src/utils/constants"
import { createPostSocketAtom } from "./socket-store"
import io from "socket.io-client"
import { currPageAtom, pageCountAtom } from "./pager-store"
import { router } from "expo-router"
import { Alert, Platform } from "react-native"
import { QnaType } from "@/src/types/question.types"
import { atomWithStorage } from "jotai/utils"
import { getAttachmentAtom, queryClientAtom } from "./general-store"
import { LocationType } from "@/src/types/location.type"
import { CreatePostClientSocket } from "@/src/types/socket/create-post-socket.types"
import Toast from "react-native-toast-message"
import { Attachment } from "@/src/types/attachment.type"
import { openDB } from "idb"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AsyncStorage as AS } from "jotai/vanilla/utils/atomWithStorage"

/**
 * How things work:
 * We have a starting page question which we grab by calling "getInitialQuestion" on the socket.
 *
 * Then we have the generated questions, which the user can request to get a new/different question.
 * To do so we emit "chat", then listen for "question"
 *
 * Last page contains hardcoded questions in the frontend.
 * We ask for the title, description, optional images, optional location, and some other settings about the post.
 */

export const INITIAL_PAGE_COUNT = 1 // last page
const DEFAULT_PUBLIC_POST = true

const settings = {
  title: "",
  description: "",
  images: [] as Attachment[],
  publicPost: DEFAULT_PUBLIC_POST,
  location: null as LocationType,
  distance: 5_000,
  zoom: 12,
  closeCity: "Click to select",
}

type SettingsType = typeof settings

function initDB() {
  return openDB("jotai", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("store")) {
        db.createObjectStore("store", { keyPath: "id" })
      }
    },
  })
}

/**
 * We use IndexedDB on web and AsyncStorage on native to store the post settings.
 * Persisting images on web with async storage didn't work.
 */
function postSettingsStorage(): AS<SettingsType> {
  return {
    getItem: async key => {
      if (Platform.OS === "web") {
        const db = await initDB()
        const value = (await db.get("store", key)) as SettingsType
        if (!value) return settings

        for (const img of value.images) {
          if (img.file) {
            const url = URL.createObjectURL(img.file)
            img.uri = url
          }
        }
        return value
      }

      const value = await AsyncStorage.getItem(key)
      if (!value) return settings
      return JSON.parse(value) as SettingsType
    },
    setItem: async (key, value: SettingsType) => {
      if (Platform.OS === "web") {
        const db = await initDB()
        await db.put("store", value, key)
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value))
      }
    },
    removeItem: async key => {
      if (Platform.OS === "web") {
        const db = await initDB()
        await db.delete("store", key)
      } else {
        await AsyncStorage.removeItem(key)
      }
    },
  }
}

export const settingsAtom = atomWithStorage("post-settings", settings, postSettingsStorage())

export const qnaAtom = atom<QnaType | null>(null)
export const loadingAtom = atom(false)
export const publicPostAtom = atom(DEFAULT_PUBLIC_POST)
export const imagesAtom = atom<Attachment[]>([])
export const editedAtom = atom(false)

export const initCreatePostAtom = atom(null, async (get, set) => {
  const userJwt = await get(userSecureAtom)
  if (!userJwt) return
  const currSocket = get(createPostSocketAtom)
  const currQna = get(qnaAtom)
  if (currSocket && (currSocket.connected || get(loadingAtom)) && currQna) {
    return
  }

  set(loadingAtom, true)

  const socket: CreatePostClientSocket = io(WS_BASE_URL + "/create-post", {
    auth: {
      token: userJwt.accessToken || "",
    },
    transports: ["websocket", "polling"],
    reconnectionDelay: 2000,
  })

  set(createPostSocketAtom, socket)

  function cleanup() {
    get(createPostSocketAtom)?.disconnect()
    set(createPostSocketAtom, null)
    set(loadingAtom, false)
    set(qnaAtom, null)
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
  }

  socket.io.on("reconnect_failed", () => {
    cleanup()
  })

  socket.on("connect", () => {
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    set(qnaAtom, null)
    set(currPageAtom, 0)
  })

  socket.on("disconnect", () => cleanup())

  socket.on("error", err => {
    set(loadingAtom, false)
    Toast.show({
      type: "error",
      text1: err,
    })
  })

  socket.on("connect_error", async () => {
    try {
      const token = await set(refreshTokensAtom)
      if (token.accessToken) {
        // @ts-ignore
        socket.auth.token = token.accessToken
      }
      socket.connect()
    } catch (err) {
      console.error("create post socket reconnect failed:", err)
      cleanup()
    }
  })

  socket.on("draftSaved", () => {
    // If on first page, invalidate my-posts to show the new draft
    if (get(currPageAtom) <= 1) {
      get(queryClientAtom).invalidateQueries({ queryKey: ["my-posts"] })
    }
  })

  socket.on("aiTitleGenerated", async (title: string) => {
    const prevSettings = await get(settingsAtom)
    await set(settingsAtom, { ...prevSettings, title })
    set(loadingAtom, false)
  })

  socket.on("question", qna => {
    set(qnaAtom, qna)
    set(loadingAtom, false)
    set(currPageAtom, curr => curr + 1)
    set(pageCountAtom, qna.length + INITIAL_PAGE_COUNT)
  })

  socket.on("draftRestored", qna => {
    set(qnaAtom, qna)
    set(pageCountAtom, qna.length + INITIAL_PAGE_COUNT)

    // Navigate to the first unanswered question, or to the last page if all answered
    const firstUnansweredIdx = qna.findIndex(item => item.answer.length === 0)
    if (firstUnansweredIdx !== -1) {
      set(currPageAtom, firstUnansweredIdx)
    } else {
      set(currPageAtom, qna.length)
    }

    set(loadingAtom, false)
  })

  socket.on("initialQuestion", defaultQuestion => {
    set(qnaAtom, [{ question: defaultQuestion, answer: [] }])
    set(pageCountAtom, INITIAL_PAGE_COUNT + 1)
    set(loadingAtom, false)
  })

  socket.on("chatFinished", () => {
    set(currPageAtom, curr => curr + 1)
    set(loadingAtom, false)
  })

  socket.on("success", async postId => {
    set(qnaAtom, null)
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    await set(settingsAtom, settings)
    set(loadingAtom, false)

    router.navigate({
      pathname: "/(details)/my-post",
      params: { id: postId },
    })
    get(queryClientAtom).invalidateQueries({ queryKey: ["my-posts"] })
  })

  socket.on("draftDiscarded", async () => {
    set(qnaAtom, null)
    set(currPageAtom, 0)
    set(pageCountAtom, INITIAL_PAGE_COUNT)
    socket.emit("getInitialQuestion")
    await set(settingsAtom, settings)
    set(editedAtom, false)
    set(loadingAtom, false)
    get(queryClientAtom).invalidateQueries({ queryKey: ["my-posts"] })
  })
})

export const forwardCreatePostAtom = atom(null, async (get, set) => {
  const qna = get(qnaAtom)
  const socket = get(createPostSocketAtom)
  const currPage = get(currPageAtom)
  const pageCount = get(pageCountAtom)
  const edited = get(editedAtom)
  const { title, description, images, publicPost, location, distance } = await get(settingsAtom)

  if (!socket || (!socket.connected && !get(loadingAtom)) || !qna) {
    console.warn("[forward] Socket is not initialized!")
    return
  }

  /**
   * Handling special pages (not regular Q&A)
   */
  // If on the last page, submit
  if (currPage === pageCount - 1) {
    if (!title || title.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Title required",
        text2: "Please enter a title for your post.",
      })
      return
    } else if (!description || description.trim() === "") {
      Toast.show({
        type: "error",
        text1: "Description required",
        text2: "Please enter a description for your post.",
      })
      return
    } else if (images.length > MAX_POST_IMAGES) {
      Toast.show({
        type: "error",
        text1: "Too many images",
        text2: `You can only upload up to ${MAX_POST_IMAGES} images.`,
      })
      return
    }
    set(loadingAtom, true)

    const imagesWithFiles: Attachment[] = []
    for (const img of images) {
      const response = await fetch(img.uri)
      const file = await response.blob()
      imagesWithFiles.push({ ...img, file })
    }

    socket.emit("submit", {
      title,
      description,
      publicPost,
      images: imagesWithFiles,
      location,
      distance,
    })

    return
  } else if (qna[currPage]?.question.optional) {
    // optional "anything else" page
    set(loadingAtom, true)
    set(editedAtom, false)
    socket.emit("chat", qna)
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
  if (!edited) {
    set(currPageAtom, curr => curr + 1)
    return
  }

  set(loadingAtom, true)
  set(editedAtom, false)
  // If user went back to change something, we need to get rid of their subsequent QAs
  // If they are just doing next normally, this will have no effect
  const qnaSlice = qna.slice(0, currPage + 1)
  socket.emit("chat", qnaSlice)
})

export const pickImageAtom = atom(null, async (get, set) => {
  set(loadingAtom, true)
  const prevSettings = await get(settingsAtom)
  const attachments = await set(getAttachmentAtom, {
    pfp: false,
    option: "library",
    multi: true,
    includeFile: Platform.OS === "web",
    limit: MAX_POST_IMAGES - prevSettings.images.length,
  })

  if (!attachments || attachments.length === 0) return

  await set(settingsAtom, { ...prevSettings, images: [...prevSettings.images, ...attachments] })

  set(loadingAtom, false)
})

export const discardDraftAtom = atom(null, async (get, set) => {
  const socket = get(createPostSocketAtom)

  function discard() {
    set(loadingAtom, true)
    socket?.emit("discardDraft")
  }

  if (Platform.OS === "web") {
    if (window.confirm("Are you sure you want to discard the current draft?")) {
      discard()
    }
    return
  }

  Alert.alert("Discard Draft", "Are you sure you want to discard the current draft?", [
    {
      text: "Cancel",
      style: "cancel",
    },
    {
      text: "Discard",
      style: "destructive",
      onPress: discard,
    },
  ])
})

export const getNewQuestionAtom = atom(null, async (get, set) => {
  const socket = get(createPostSocketAtom)
  const qna = get(qnaAtom)
  const currPage = get(currPageAtom)
  if (!qna || currPage >= qna.length) return

  function getNew() {
    if (!qna) return

    if (currPage === 0) {
      // If on the first page, just restart
      set(loadingAtom, true)
      socket?.emit("discardDraft")
      return
    } else if (currPage === qna.length + 1) {
      // If on the last page, do nothing
      return
    }

    set(loadingAtom, true)
    const qnaSlice = qna.slice(0, currPage)
    set(currPageAtom, curr => curr - 1)
    socket?.emit("chat", qnaSlice)
  }

  if (Platform.OS === "web") {
    if (
      window.confirm(
        "Are you sure you want to get a different question? Your current progress on this question will be lost."
      )
    ) {
      getNew()
    }
    return
  }

  Alert.alert(
    "Get New Question",
    "Are you sure you want to get a different question? Your current progress on this question will be lost.",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Redo",
        style: "default",
        onPress: getNew,
      },
    ]
  )
})

// Function that's called when an image is removed
export const createPostRemoveImageAtom = atom(null, (get, set, index: number) => {
  set(settingsAtom, async curr => {
    const currSettings = await curr
    return {
      ...currSettings,
      images: currSettings.images.filter((_, i) => i !== index),
    }
  })
})
