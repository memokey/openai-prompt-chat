import { atom } from "jotai"

export enum ChatPersona {
  BOT = "bot",
  USER = "user",
}

export type Message = {
  // id: string
  text: string
  from: ChatPersona
  createdAt: Date
}

export type ChatHistoryItem = {
  id: string
  name: string
}

export type Chat = {
  id: string
  name: string
  messages: Message[]
}

export const chatHistoryAtom = atom<ChatHistoryItem[]>([])

export const selectedChatAtom = atom<string | null>(null)

export const chatAtom = atom<Chat | null>(null)

export const setChatTitleAtom = atom(null, (get, set, name: string) => {
  const chat = get(chatAtom)
  const chatHistory = get(chatHistoryAtom)
  const selected = get(selectedChatAtom)
  if (chat && selected) {
    set(chatAtom, { ...chat, name })
    const newChatHistory = chatHistory.map((chat) => {
      if (chat.id === selected) {
        return {
          ...chat,
          name,
        }
      }
      return chat
    })
    set(chatHistoryAtom, newChatHistory)
  }
})

export const chatHasTitleAtom = atom((get) => !!get(chatAtom)?.name)

export const removeChatAtom = atom(null, (get, set, id: string) => {
  set(
    chatHistoryAtom,
    get(chatHistoryAtom).filter((chat) => chat.id !== id)
  )
  if (get(chatAtom)?.id === id) {
    set(chatAtom, null)
    set(selectedChatAtom, null)
  }
})

export const createChatAtom = atom(null, (get, set, id: string) => {
  set(chatHistoryAtom, [
    ...get(chatHistoryAtom),
    {
      id,
      name: "",
    },
  ])
  set(selectedChatAtom, id)
  set(chatAtom, {
    id,
    name: "",
    messages: [],
  })
})

export const addMessageAtom = atom(null, (get, set, message: Message) => {
  const chat = get(chatAtom)
  if (chat) {
    set(chatAtom, { ...chat, messages: [...chat.messages, message] })
  }
})
