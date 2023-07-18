import { MouseEvent, useEffect } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { XCircleIcon } from "@heroicons/react/20/solid"
import toast from "react-hot-toast"

import { trpc } from "@/utils/trpc"
import {
  chatAtom,
  chatHistoryAtom,
  createChatAtom,
  removeChatAtom,
  selectedChatAtom,
} from "@/state/chats"
import { keyAtom } from "@/state/user"
import { decryptText } from "@/utils/crypto"

export function ChatHistory() {
  const [selectedChat, setSelectedChat] = useAtom(selectedChatAtom)
  const [chats, setChatHistory] = useAtom(chatHistoryAtom)
  const setChat = useSetAtom(chatAtom)
  const createChat = useSetAtom(createChatAtom)
  const removeChat = useSetAtom(removeChatAtom)
  const key = useAtomValue(keyAtom)

  const { data: chatHistory } = trpc.chat.getChatHistories.useQuery()

  const createChatMutation = trpc.chat.create.useMutation({
    onSuccess(chat) {
      createChat(chat.id)
    },
    onError() {
      toast(`An error occured creating the chat`)
    },
  })

  const deleteChatMutation = trpc.chat.delete.useMutation()

  useEffect(() => {
    if (chatHistory && key) {
      const chatHistoryDecrypted = chatHistory.map((chat) => ({
        ...chat,
        name: decryptText(chat.name, key),
      }))
      setChatHistory(chatHistoryDecrypted)
    }
  }, [chatHistory, setChatHistory, key])

  const selectChatAction = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    id: string
  ) => {
    e.preventDefault()
    if (id === selectedChat) {
      setSelectedChat(null)
      setChat(null)
    } else {
      setSelectedChat(id)
    }
  }

  const removeChatAction = (
    e: MouseEvent<SVGSVGElement, globalThis.MouseEvent>,
    id: string
  ) => {
    e.preventDefault()
    e.stopPropagation()
    deleteChatMutation.mutate({ id })
    removeChat(id)
  }

  const createChatAction = (
    e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>
  ) => {
    e.preventDefault()
    createChatMutation.mutate()
  }

  return (
    <div className="flex flex-col w-full">
      <button
        className="btn btn-primary mx-2"
        onClick={(e) => createChatAction(e)}
      >
        Create Chat
      </button>
      <div className="mt-2">
        {chats.map((chat) => (
          <div
            onClick={(e) => selectChatAction(e, chat.id)}
            key={chat.id}
            className={`${
              selectedChat === chat.id ? "bg-primary/40" : "bg-secondary/30"
            } flex flex-row p-3 w-full items-center hover:cursor-pointer mb-1 py-2 h-12 select-none hover:bg-primary/75`}
          >
            <div className="flex-1 truncate h-full">{chat.name}</div>
            <XCircleIcon
              onClick={(e) => removeChatAction(e, chat.id)}
              className="flex-none h-5 w-5"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
