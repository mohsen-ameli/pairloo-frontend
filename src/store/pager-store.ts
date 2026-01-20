import { atom } from "jotai"

export const currPageAtom = atom(0)
export const pageCountAtom = atom(0)

// Use this to configure what the next and back (flow) buttons do and whether they are enabled
export const flowAtom = atom({
  back: null as null | (() => void),
  next: null as null | (() => void),
  backEnabled: true,
  nextEnabled: true,
})
