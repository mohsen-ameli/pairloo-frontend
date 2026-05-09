import { Socket } from "socket.io-client"
import { LocationType } from "../location.type"
import { QnaType } from "../question.types"
import { Attachment } from "../attachment.type"

// THIS FILE SHOULD BE KEPT IN SYNC WITH THE BACKEND

interface ServerToClientEvents {
  error: (message: string) => void
  draftRestored: (qna: QnaType) => void
  question: (qna: QnaType) => void
  chatFinished: () => void
  draftSaved: () => void
  aiTitleGenerated: (title: string) => void
  success: (message: string) => void
  draftDiscarded: () => void
}

interface ClientToServerEvents {
  chat: (qna: QnaType) => void
  aiTitle: () => void
  submit: (newPost: {
    title: string
    description: string
    publicPost: boolean
    images: Attachment[] | undefined
    location: LocationType
    distance: number
  }) => void
  discardDraft: () => void
  updateDraftSettings: (
    title: string,
    description: string,
    images: Attachment[],
    publicPost: boolean
  ) => void
}

export type CreatePostClientSocket = Socket<ServerToClientEvents, ClientToServerEvents>
