import { ChangeEvent, KeyboardEvent, useEffect, useState, useRef } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import superjson from "superjson"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { ChaoticOrbit } from "@uiball/loaders"
import { PaperAirplaneIcon } from "@heroicons/react/20/solid"
import ReactMarkdown from "react-markdown"
import gfm from "remark-gfm"

import {
  chatGPTKeyAtom,
  chatGPTModelAtom,
  useOwnOpenaiKeyAtom,
} from "@/state/config"
import {
  ChatPersona,
  Message,
  addMessageAtom,
  chatAtom,
  chatHasTitleAtom,
  selectedChatAtom,
  setChatTitleAtom,
} from "@/state/chats"
import { trpc } from "@/utils/trpc"
import { Chatter } from "@/services/chatGPT"
import { chatTextAtom } from "@/state/chatInput"
import { keyAtom } from "@/state/user"
import { decryptText, encryptText } from "@/utils/crypto"

const emptyBotMessage = () => ({
  from: ChatPersona.BOT,
  text: "",
  createdAt: new Date(),
})

export function ChatBody() {
  const { data: session } = useSession()
  const useOwnOpenaiKey = useAtomValue(useOwnOpenaiKeyAtom)
  const [text, setText] = useAtom(chatTextAtom)
  const [loading, setLoading] = useState(false)
  const [chatter, setChatter] = useState<Chatter>()
  const selectedChat = useAtomValue(selectedChatAtom)
  const [chat, setChat] = useAtom(chatAtom)
  const chatHasTitle = useAtomValue(chatHasTitleAtom)
  const setChatTitle = useSetAtom(setChatTitleAtom)
  const addMessage = useSetAtom(addMessageAtom)
  const apiKey = useAtomValue(chatGPTKeyAtom)
  const model = useAtomValue(chatGPTModelAtom)
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamText, setStreamText] = useState(emptyBotMessage())
  const key = useAtomValue(keyAtom)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const { data: oldChat } = trpc.chat.get.useQuery(
    { id: selectedChat || "" },
    { enabled: !!selectedChat }
  )

  const addMessageToDb = trpc.chat.addMessage.useMutation()
  const setTitleToDb = trpc.chat.setChatTitle.useMutation()

  useEffect(() => {
    if (oldChat && apiKey && apiKey !== "" && key) {
      const decryptedMessages = oldChat.messages.map((message) => {
        return {
          ...message,
          text: decryptText(message.text, key),
        }
      })
      const chatWithDecodedMessages = {
        ...oldChat,
        messages: decryptedMessages,
      }
      setChat(chatWithDecodedMessages)
      setChatter(new Chatter(apiKey, decryptedMessages, model))
    }
  }, [oldChat, setChat, apiKey, key, model])

  useEffect(() => {
    scrollToBottom()
  }, [chat?.messages])

  useEffect(() => {
    const setTitle = async () => {
      if (chatter && chat?.id && useOwnOpenaiKey) {
        const apiRes = await chatter.setTitle()
        if (key) {
          setTitleToDb.mutate({
            id: chat?.id,
            name: encryptText(apiRes.response, key),
          })
        }
        setChatTitle(apiRes.response)
      } else if (!useOwnOpenaiKey && chat?.id) {
        const json = superjson.serialize({
          messages: chat?.messages.map((message) => ({
            ...message,
            createdAt: new Date(message.createdAt),
          })),
        })

        const request: RequestInit = {
          method: "POST",
          body: JSON.stringify(json),
          headers: {
            "Content-Type": "application/json",
          },
        }

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/chat/title`,
          request
        )

        const title = await res.json()

        if (key) {
          setTitleToDb.mutate({
            id: chat?.id,
            name: encryptText(title, key),
          })
        }
        setChatTitle(title)
      }
    }
    if (!chatHasTitle && chat?.messages.length && chat?.messages.length > 1) {
      setTitle().catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatHasTitle, chat?.messages.length])

  const sendChatMessTroughApi = async (prompt: string) => {
    if (session) {
      const json = superjson.serialize({
        messages: chat?.messages.map((message) => ({
          ...message,
          createdAt: new Date(message.createdAt),
        })),
        prompt,
      })

      const request: RequestInit = {
        method: "POST",
        body: JSON.stringify(json),
        headers: {
          "Content-Type": "application/json",
        },
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_URL}/api/chat/message`,
        request
      )
      return res
    }
  }

  const updateText = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setText(e.target.value)
  }

  const interceptKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.code === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(text)
      setText("")
    }
  }

  async function sendMessage(text: string) {
    let message: Message = {
      text,
      from: ChatPersona.USER,
      createdAt: new Date(),
    }
    addMessage(message)
    if (selectedChat && key) {
      message = {
        ...message,
        text: encryptText(message.text, key),
      }
      addMessageToDb.mutate({
        chatId: selectedChat,
        message,
      })
    }

    setLoading(true)

    if (!useOwnOpenaiKey) {
      try {
        const response = await sendChatMessTroughApi(text)
        if (!response) {
          throw new Error("no response")
        }
        if (!response.ok) {
          throw new Error(response.statusText)
        }
        const data = response.body
        if (!data) {
          return
        }

        const reader = data.getReader()
        const decoder = new TextDecoder()
        let done = false

        setIsStreaming(true)
        let botText = ""
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = decoder.decode(value)
          botText = botText + chunkValue
          setStreamText((old) => {
            return { ...old, text: old.text + chunkValue }
          })
          scrollToBottom()
        }

        let messageReceived: Message = {
          text: botText,
          from: ChatPersona.BOT,
          createdAt: new Date(),
        }
        addMessage(messageReceived)

        if (selectedChat && key) {
          messageReceived = {
            ...messageReceived,
            text: encryptText(messageReceived.text, key),
          }
          addMessageToDb.mutate({
            chatId: selectedChat,
            message: messageReceived,
          })
        }
      } catch (e) {
        console.error(e)
        toast("There was an error getting the reply")
      }
    } else {
      console.log("try to chatttt")
      if (chatter) {
        try {
          setIsStreaming(true)
          const apiRes = await chatter.call(
            text,
            (t) => {
              setStreamText((old) => {
                return { ...old, text: old.text + t }
              })
              scrollToBottom()
            },
            () => {
              setIsStreaming(false)
              setStreamText(emptyBotMessage())
            },
            (e) => {
              setIsStreaming(false)
              setStreamText(emptyBotMessage())
              console.error(e)
            }
          )
          let message: Message = {
            text: apiRes.response,
            from: ChatPersona.BOT,
            createdAt: new Date(),
          }
          addMessage(message)

          if (selectedChat && key) {
            message = {
              ...message,
              text: encryptText(message.text, key),
            }
            addMessageToDb.mutate({
              chatId: selectedChat,
              message,
            })
          }
        } catch (e) {
          console.error(e)
          toast("There was an error getting the reply")
        }
      }
    }

    setIsStreaming(false)
    setStreamText(emptyBotMessage())
    setLoading(false)
  }

  const chatToshow = isStreaming
    ? [...(chat?.messages || []), streamText]
    : chat?.messages || []

  return (
    <div className="card-body flex flex-col max-sm:p-0">
      <div className="h-[calc(100vh-20rem)] overflow-y-auto">
        {chatToshow.map((message, i) => {
          return (
            <div
              key={i}
              className={`${
                message.from === ChatPersona.BOT
                  ? "bg-secondary/30"
                  : "bg-primary/30"
              } px-4 py-5 mb-2 flex-1 relative rounded-md`}
            >
              {message.from === ChatPersona.BOT && (
                <svg
                  className="h-5 w-5 pr-1 absolute top-0 left-1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                >
                  <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z" />
                </svg>
              )}
              <ReactMarkdown
                remarkPlugins={[gfm]}
                components={{
                  code: ({ children, inline }) => {
                    if (inline) {
                      return (
                        <code
                          className={`${
                            message.from === ChatPersona.BOT
                              ? "bg-secondary/20"
                              : "bg-primary/20"
                          } p-1 rounded-sm`}
                        >
                          {children}
                        </code>
                      )
                    }
                    return (
                      <pre
                        className={`${
                          message.from === ChatPersona.BOT
                            ? "bg-secondary/20"
                            : "bg-primary/20"
                        } p-2 m-2 rounded-md whitespace-pre-wrap`}
                      >
                        <code>{children}</code>
                      </pre>
                    )
                  },
                  table: ({ children }) => {
                    return (
                      <div className="p-2">
                        <table>{children}</table>
                      </div>
                    )
                  },
                }}
              >
                {message.text}
              </ReactMarkdown>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
      <div
        className={`flex-none w-full relative ${
          (!apiKey || apiKey === "") && useOwnOpenaiKey && "tooltip"
        }`}
        data-tip="You have not set an api key in settings!"
      >
        {loading && (
          <div className="h-10 w-10 absolute top-1/4 left-1/2">
            <ChaoticOrbit />
          </div>
        )}
        <PaperAirplaneIcon
          className="h-5 w-5 hover:cursor-pointer absolute bottom-5 left-5"
          onClick={() => {
            sendMessage(text)
            setText("")
          }}
        />
        <textarea
          className="textarea textarea-bordered w-full resize-none rounded-md h-[6rem]"
          placeholder="Tell me something..."
          value={text}
          onChange={(e) => updateText(e)}
          onKeyDown={(e) => interceptKey(e)}
          disabled={((!apiKey || apiKey === "") && useOwnOpenaiKey) || loading}
        />
      </div>
    </div>
  )
}
