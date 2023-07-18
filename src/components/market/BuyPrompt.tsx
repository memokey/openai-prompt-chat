import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useAtomValue } from "jotai"
import { MarketPrompt } from "@prisma/client"
import { promptManagerAtom } from "@/state/prompts"
import { StepInfo } from "@/components/common/StepInfo"
import { trpc } from "@/utils/trpc"

interface IPromptInfo {
  selectedPrompt: MarketPrompt
  hasPrompt?: boolean
  buyPrompt: () => void
}

function PromptInfo({ selectedPrompt, hasPrompt, buyPrompt }: IPromptInfo) {
  return (
    <div>
      {hasPrompt && <div className="bg-warning text-center rounded-md m-4">You already have this prompt, you can download it from the library</div>}
      <h2 className="p-1 card-title">{selectedPrompt?.name}</h2>
      <div className="p-1">Description: {selectedPrompt?.description}</div>
      <div className="p-1">Price: {selectedPrompt?.price}</div>
      <div className="p-1">Address: {selectedPrompt?.address}</div>
      <div className="p-1">Url: {selectedPrompt?.url}</div>
      <div className="w-full flex flex-row-reverse place-content-between">
        <button disabled={hasPrompt} className="btn btn-primary mt-1" onClick={buyPrompt}>
          Buy
        </button>
      </div>
    </div>
  )
}

interface IBuyPrompt {
  selectedPrompt: MarketPrompt
  close: boolean
}

export function BuyPrompt({ selectedPrompt, close }: IBuyPrompt) {
  const promptManager = useAtomValue(promptManagerAtom)
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [stateMessage, setStateMessage] = useState<string | undefined>(
    undefined
  )

  const { data: hasPrompt } = trpc.library.hasPrompt.useQuery({ address: selectedPrompt.address })
  const createPromptMutation = trpc.prompt.create.useMutation({
    onError() {
      toast(`An error occured creating the prompt`)
    },
  })
  const addPromptToLibraryMutation = trpc.library.addPrompt.useMutation({
    onError() {
      toast(`An error occured adding the prompt to the library`)
    },
  })

  useEffect(() => {
    setStep(0)
  }, [close])

  const buyPrompt = async () => {
    if (promptManager) {
      try {
        setLoading(true)
        const res = await promptManager.buyPrompt(
          selectedPrompt.address,
          selectedPrompt.url,
          selectedPrompt.price.toString(),
          updateStateMessage
        )
        setLoading(false)
        if (res) {
          addPromptToLibraryMutation.mutate({ address: selectedPrompt.address })
          createPromptMutation.mutate({
            name: selectedPrompt.name,
            text: res,
            createdAt: new Date(),
          })
          setStep(1)
        }
      } catch (e) {
        console.error(e)
        toast("There was an error buying the prompt")
        setLoading(false)
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
          <div className="p-2">
            Congratulation on buying &quot;{selectedPrompt.name}&quot;, the
            prompt is now in your library.
          </div>
        )
      default:
        return (
          <PromptInfo selectedPrompt={selectedPrompt} buyPrompt={buyPrompt} hasPrompt={hasPrompt} />
        )
    }
  })()

  return <>{loading ? <StepInfo message={stateMessage} /> : stepToShow}</>
}
