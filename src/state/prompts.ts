import { PromptManager } from "@/services/promptManager"
import { atom } from "jotai"

export type Prompt = {
  id: string
  name: string
  text: string
  createdAt: Date
}

export type PromptDataToSell = {
  name: string
  description: string
  text: string
  price: number
  tags: string[]
}

export type PromptSellResult = {
  name: string
  description: string
  price: number
  address: string
  url: string
  tags: string[]
}

export const promptsAtom = atom<Prompt[]>([])

export const createPromptAtom = atom(null, (get, set, newPrompt: Prompt) => {
  const prompts = get(promptsAtom)
  set(promptsAtom, [...prompts, newPrompt])
})

export const editPromptAtom = atom(
  null,
  (
    get,
    set,
    { id, name, text }: { id: string; name: string; text: string }
  ) => {
    const prompts = get(promptsAtom).map((prompt) => {
      if (prompt.id === id) {
        return {
          ...prompt,
          name,
          text,
        }
      }
      return prompt
    })
    set(promptsAtom, prompts)
  }
)

export const deletePromptAtom = atom(null, (get, set, id: string) => {
  const prompts = get(promptsAtom).filter((prompt) => prompt.id !== id)
  set(promptsAtom, prompts)
})

export const promptManagerAtom = atom<PromptManager | null>(null)
