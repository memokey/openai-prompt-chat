import { atomWithStorage } from "jotai/utils"

export const chatGPTKeyAtom = atomWithStorage("mindgem/chat-gpt-key", "")

export const useOwnOpenaiKeyAtom = atomWithStorage('mindgem/own-openai-key', false)

export const chatGPTModelAtom = atomWithStorage<string | undefined>(
  "mindgem/model",
  undefined
)
