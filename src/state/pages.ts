import { atom } from "jotai"

export enum page {
  CHAT = "chat",
  MARKET  = "market",
  LIBRARY = 'library',
  SETTINGS = "settings"
}
export const selectedPageAtom = atom(page.CHAT)

export enum chatTabs {
  CHATS,
  PROMPTS
}
export const chatsOrPromptsAtom = atom(chatTabs.CHATS)