import { ChangeEvent, useEffect, useState } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

import DropDown from "@/components/common/DropDown"
import Modal from "@/components/common/Modal"
import {
  createPromptAtom,
  deletePromptAtom,
  editPromptAtom,
  promptsAtom,
} from "@/state/prompts"
import { trpc } from "@/utils/trpc"
import toast from "react-hot-toast"
import { selectedChatAtom } from "@/state/chats"
import { chatTextAtom } from "@/state/chatInput"
import PromptEdit from "./PromptEdit"
import SellPrompt from "./SellPrompt"

export function Prompts() {
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [openNew, setOpenNew] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [openSell, setOpenSell] = useState(false)
  const [idEdited, setIdEdited] = useState<string | null>(null)
  const [prompts, setPrompts] = useAtom(promptsAtom)
  const createPrompt = useSetAtom(createPromptAtom)
  const deletePrompt = useSetAtom(deletePromptAtom)
  const editPrompt = useSetAtom(editPromptAtom)
  const chatSelected = useAtomValue(selectedChatAtom)
  const setChatText = useSetAtom(chatTextAtom)

  const { data: promptsList } = trpc.prompt.getAll.useQuery()

  const createPromptMutation = trpc.prompt.create.useMutation({
    onSuccess(prompt) {
      createPrompt(prompt)
    },
    onError() {
      toast(`An error occured creating the prompt`)
    },
  })

  const deletePromptMutation = trpc.prompt.delete.useMutation({
    onSuccess({ id }: { id: string }) {
      deletePrompt(id)
      setIdEdited(null)
    },
    onError() {
      toast(`An error occured deleting the prompt`)
    },
  })

  const updatePromptMutation = trpc.prompt.update.useMutation({
    onSuccess(prompt) {
      editPrompt({ id: prompt.id, name: prompt.name, text: prompt.text })
    },
    onError() {
      toast(`An error occured deleting the prompt`)
    },
  })

  useEffect(() => {
    if (promptsList) {
      setPrompts(promptsList)
    }
  }, [promptsList, setPrompts])

  const updateTitle = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setTitle(e.target.value)
  }

  const updateText = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setText(e.target.value)
  }

  const createNewPrompt = () => {
    setOpenNew(false)
    createPromptMutation.mutate({
      name: title,
      text,
      createdAt: new Date(),
    })
    setTitle("")
    setText("")
  }

  const savePrompt = () => {
    setOpenEdit(false)
    if (idEdited) {
      updatePromptMutation.mutate({
        id: idEdited,
        name: title,
        text,
      })
    }
    setTitle("")
    setText("")
  }

  const deletePromptAction = (id: string) => {
    deletePromptMutation.mutate({ id })
  }

  const closeModal = () => {
    setOpenNew(false)
    setOpenEdit(false)
    setOpenSell(false)
    setTitle("")
    setText("")
  }

  return (
    <div className="flex flex-col w-full">
      <button
        className="btn btn-primary mx-2"
        onClick={(e) => {
          setOpenNew(true)
        }}
      >
        Create Prompt
      </button>
      <div className="mt-2">
        {prompts.map((prompt, i) => (
          <div
            onClick={() => {
              if (chatSelected) {
                setChatText(prompt.text)
              }
            }}
            key={i}
            className={`flex flex-row p-3 w-full items-center hover:cursor-pointer active:bg-primary mb-1 py-2 h-12 select-none bg-secondary/50 hover:bg-primary/75`}
          >
            <div className="flex-1 truncate h-full">{prompt.name}</div>
            <DropDown
              options={[
                {
                  text: "Sell",
                  action: () => {
                    setTitle(prompt.name)
                    setText(prompt.text)
                    setIdEdited(prompt.id)
                    setOpenSell(true)
                  },
                },
                {
                  text: "Edit",
                  action: () => {
                    setTitle(prompt.name)
                    setText(prompt.text)
                    setIdEdited(prompt.id)
                    setOpenEdit(true)
                  },
                },
                {
                  text: "Delete",
                  action: () => {
                    deletePromptAction(prompt.id)
                  },
                },
              ]}
            />
          </div>
        ))}
      </div>
      <Modal
        open={openNew}
        onClose={() => {
          closeModal()
        }}
      >
        <PromptEdit
          title={title}
          text={text}
          updateText={updateText}
          updateTitle={updateTitle}
          savePrompt={createNewPrompt}
        />
      </Modal>
      <Modal
        open={openEdit}
        onClose={() => {
          closeModal()
        }}
      >
        <PromptEdit
          title={title}
          text={text}
          updateText={updateText}
          updateTitle={updateTitle}
          savePrompt={savePrompt}
        />
      </Modal>
      <Modal
        open={openSell}
        onClose={() => {
          closeModal()
        }}
      >
        <SellPrompt title={title} text={text} close={openSell} />
      </Modal>
    </div>
  )
}
