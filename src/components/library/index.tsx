import { useEffect, useState } from "react"
import { trpc } from "@/utils/trpc"
import { MarketPrompt } from "@prisma/client"
import Modal from "@/components/common/Modal"
import { StepInfo } from "@/components/common/StepInfo"
import toast from "react-hot-toast"
import { promptManagerAtom } from "@/state/prompts"
import { useAtomValue } from "jotai"

interface IPromptCard {
  prompt: MarketPrompt
  action: (prompt: MarketPrompt) => void
}

function PromptCard({ prompt, action }: IPromptCard) {
  return (
    <div key={prompt.address} className="card w-64 h-64 m-4 bg-base-100">
      <div className="card-body">
        <h2 className="card-title">{prompt.name}</h2>
        <p>{prompt.description}</p>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary"
            onClick={() => {
              action(prompt)
            }}
          >
            Import Prompt
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Library() {
  const promptManager = useAtomValue(promptManagerAtom)
  const [step, setStep] = useState(0)
  const [importPromptOpen, setImportPromptOpen] = useState(false)
  const [stateMessage, setStateMessage] = useState<string | undefined>(
    undefined
  )

  useEffect(() => {
    if (importPromptOpen === false) {
      setStep(0)
    }
  }, [importPromptOpen])

  const { data: library } = trpc.library.getAll.useQuery()

  const createPromptMutation = trpc.prompt.create.useMutation({
    onError() {
      toast(`An error occured creating the prompt`)
    },
  })

  const importPrompt = async (prompt: MarketPrompt) => {
    if (promptManager) {
      try {
        setImportPromptOpen(true)
        const res = await promptManager.importPrompt(
          prompt.address,
          prompt.url,
          updateStateMessage
        )
        if (res) {
          createPromptMutation.mutate({
            name: prompt.name,
            text: res,
            createdAt: new Date(),
          })
        }
        setStep(1)
      } catch (e) {
        console.error(e)
        toast("There was an error buying the prompt")
        setStep(0)
        setImportPromptOpen(false)
      }
    }
  }

  const updateStateMessage = (message: string) => {
    setStateMessage(message)
  }

  const stepToShow = (() => {
    switch (step) {
      case 1:
        return (
          <div className="p-2">You added this prompt to you prompt list.</div>
        )
      default:
        return <StepInfo message={stateMessage} />
    }
  })()

  return (
    <div className="h-full w-[80%] flex flex-wrap">
      {library?.prompts.map((prompt) => {
        return (
          <PromptCard
            key={prompt.address}
            prompt={prompt}
            action={importPrompt}
          />
        )
      })}
      <Modal
        open={importPromptOpen}
        onClose={() => {
          setImportPromptOpen(false)
        }}
      >
        {stepToShow}
      </Modal>
    </div>
  )
}
