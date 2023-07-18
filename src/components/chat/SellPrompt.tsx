import { useAtomValue } from "jotai"
import { ChangeEvent, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { trpc } from "@/utils/trpc"
import {
  PromptDataToSell,
  PromptSellResult,
  promptManagerAtom,
} from "@/state/prompts"
import { StepInfo } from "@/components/common/StepInfo"

interface ISetData {
  title: string
  text: string
  sendData: (data: PromptDataToSell) => void
}

function SetData({ title, text, sendData }: ISetData) {
  const [titleForm, setTitleForm] = useState("")
  const [descriptionForm, setDescriptionForm] = useState("")
  const [textForm, setTextForm] = useState("")
  const [tagsForm, setTagsForm] = useState("")
  const [price, setPrice] = useState(0)

  useEffect(() => {
    setTitleForm(title)
    setTextForm(text)
    setDescriptionForm("")
    setTagsForm("")
    setPrice(0)
  }, [text, title])

  const updateTitle = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setTitleForm(e.target.value)
  }
  const updateDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setDescriptionForm(e.target.value)
  }
  const updateText = (e: ChangeEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    setTextForm(e.target.value)
  }
  const updatePrice = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setPrice(parseFloat(e.target.value))
  }
  const updateTags = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setTagsForm(e.target.value)
  }

  return (
    <>
      <div>Title</div>
      <input
        type="text"
        placeholder="title"
        className="input input-bordered rounded-md w-full"
        value={titleForm}
        onChange={(e) => updateTitle(e)}
      />
      <div>Description</div>
      <textarea
        className="textarea textarea-bordered w-full resize-none rounded-md mt-2 h-[6rem]"
        placeholder="Description"
        value={descriptionForm}
        onChange={updateDescription}
      />
      <div>Prompt</div>
      <textarea
        className="textarea textarea-bordered w-full resize-none rounded-md mt-2 h-[6rem]"
        placeholder="Your prompt"
        value={textForm}
        onChange={updateText}
      />
      <div>Price</div>
      <input
        type="number"
        placeholder="price"
        className="input input-bordered rounded-md w-full"
        value={price}
        onChange={(e) => updatePrice(e)}
      />
      <div>Tags (separate with &quot;,&quot;)</div>
      <input
        type="string"
        placeholder="tags"
        className="input input-bordered rounded-md w-full"
        value={tagsForm}
        onChange={(e) => updateTags(e)}
      />
      <div className="w-full flex flex-row-reverse place-content-between">
        <button
          className="btn btn-primary mt-1"
          onClick={() => {
            const tags = tagsForm.split(",").map((tag) => tag.trim())
            sendData({
              name: titleForm,
              description: descriptionForm,
              text: textForm,
              price: price,
              tags,
            })
          }}
        >
          Sell
        </button>
      </div>
    </>
  )
}

interface IPromptInfo {
  data?: PromptSellResult
}

function PromptInfo({ data }: IPromptInfo) {
  return (
    <div className="flex flex-col items-start content-center w-full p-4">
      <div className="p-3">Name: {data?.name}</div>
      <div className="p-3">Description: {data?.description}</div>
      <div className="p-3">Price: {data?.price}</div>
      <div className="p-3">Address: {data?.address}</div>
      <div className="p-3">Url: {data?.url}</div>
    </div>
  )
}

interface ISellPrompt {
  title: string
  text: string
  close: boolean
}

export default function SellPrompt({ title, text, close }: ISellPrompt) {
  const promptManager = useAtomValue(promptManagerAtom)
  const [step, setStep] = useState(0)
  const [stateMessage, setStateMessage] = useState<string | undefined>(
    undefined
  )
  const [loading, setLoading] = useState(false)
  const [sellPromptData, setSellPromptData] = useState<
    PromptSellResult | undefined
  >(undefined)

  const createMarketPromptMutation = trpc.marketPrompt.create.useMutation({
    onSuccess() {
      console.log("Prompt saved")
    },
    onError(e) {
      console.error(e)
      toast("An error occured while saving the prompt")
    },
  })

  useEffect(() => {
    setStep(0)
  }, [close])

  const sendData = async (data: PromptDataToSell) => {
    if (promptManager) {
      try {
        setLoading(true)
        const res = await promptManager.sellPrompt(
          data,
          `${data.price}`,
          updateStateMessage
        )
        createMarketPromptMutation.mutate(res)
        setSellPromptData(res)
        setLoading(false)
        setStep(1)
      } catch (e) {
        console.error(e)
        toast("There was an error setting the prompt to sell")
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
        return <PromptInfo data={sellPromptData} />
      default:
        return <SetData title={title} text={text} sendData={sendData} />
    }
  })()

  return <>{loading ? <StepInfo message={stateMessage} /> : stepToShow}</>
}
