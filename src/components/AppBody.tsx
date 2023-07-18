import { useEffect } from "react"
import { useAtomValue, useSetAtom } from "jotai"

import NavBar from "./NavBar"
import Chat from "@/components/chat/Chat"
import { selectedPageAtom, page } from "@/state/pages"
import Settings from "@/components/settings/Settings"
import { trpc } from "@/utils/trpc"
import { keyAtom } from "@/state/user"
import { decryptKey, encryptKey, getNewKey } from "@/utils/crypto"
import { PromptManager } from "@/services/promptManager"
import { promptManagerAtom } from "@/state/prompts"
import Market from "./market"
import Library from "./library"

function PageContent() {
  const pageSelected = useAtomValue(selectedPageAtom)
  const component = (() => {
    switch (pageSelected) {
      case page.CHAT:
        return <Chat />
      case page.SETTINGS:
        return <Settings />
      case page.MARKET:
        return <Market />
      case page.LIBRARY:
        return <Library />
    }
  })()

  return (
    <div className="flex flex-col items-center justify-center w-full bg-slate-50">
      {component}
    </div>
  )
}

export default function AppBody() {
  const setPromptManager = useSetAtom(promptManagerAtom)
  const { data: maybeKey, error: errorGetKey } = trpc.user.getKey.useQuery()
  const setKeyToDb = trpc.user.setKey.useMutation({
    onSuccess(data) {
      setKey(data.key)
    },
  })
  const setKey = useSetAtom(keyAtom)

  useEffect(() => {
    const decodeAndSetKey = async (keyToDecode: string) => {
      try {
        const key = await decryptKey(keyToDecode)
        setKey(key)
      } catch(e) {
        console.error(e)
      }
    }
    if (maybeKey) {
      if (maybeKey.key) {
        decodeAndSetKey(maybeKey.key)
      }
    }
  }, [maybeKey, setKey])

  useEffect(() => {
    const getNewKeyAndEncode = async () => {
      try {
        const newKey = getNewKey()
        const encryptedKey = await encryptKey(newKey)
        setKeyToDb.mutate({ key: encryptedKey })
      } catch(e) {
        console.error(e)
      }
    }
    if (errorGetKey?.message === "NOT_FOUND") {
      getNewKeyAndEncode()
    }
  }, [errorGetKey, setKeyToDb])

  useEffect(() => {
    const setupPromptManager = async () => {
      const promptManager = new PromptManager()
      await promptManager.setup()
      setPromptManager(promptManager)
    }
    setupPromptManager()
  }, [setPromptManager])

  return (
    <div className="flex flex-row flex-1">
      <NavBar />
      <PageContent />
    </div>
  )
}
