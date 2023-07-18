import { useAtom, useAtomValue } from "jotai"
import { Toaster } from "react-hot-toast"

import { chatTabs, chatsOrPromptsAtom } from "@/state/pages"
import { Chat, selectedChatAtom } from "@/state/chats"
import { ChatHistory } from "./ChatHistory"
import { ChatBody } from "./ChatBody"
import { Prompts } from "./Prompt"

function WelcomeCard() {
  return (
    <div className="card-body flex flex-col">
      <div className="flex-1 text-center">Please create or select a chat</div>
    </div>
  )
}

export default function Chat() {
  const [selectedTab, setSelectedTab] = useAtom(chatsOrPromptsAtom)
  const selectedChat = useAtomValue(selectedChatAtom)

  return (
    <div className="flex flex-row w-full h-full">
      <div className="h-full w-1/6 bg-base-200/20">
        <div className="flex flex-col w-full items-center"></div>
        <div className="tabs flex m-[2px]">
          <div
            className={`px-[54px] py-[8px] bg-violetStrong text-white text-[16px]  tab ${selectedTab === chatTabs.CHATS && "tab-active"}`}
            onClick={() => setSelectedTab(chatTabs.CHATS)}
          >
            Chats
          </div>
          <div
            className={`tab ${
              selectedTab === chatTabs.PROMPTS && "tab-active"
            }`}
            onClick={() => setSelectedTab(chatTabs.PROMPTS)}
          >
            Prompts
          </div>
        </div>
        <div className="divider m-0"></div>
        {selectedTab === chatTabs.CHATS ? <ChatHistory /> : <Prompts />}
      </div>
      <div className="card w-2/3 h-full bg-base-100 shadow-md p-10 rounded-none max-sm:p-6">
        {selectedChat === null ? <WelcomeCard /> : <ChatBody />}
      </div>
      <div className="h-full w-1/6 bg-base-200/20"></div>
      <Toaster />
    </div>
  )
}
