import { ChangeEvent, useState, useEffect } from "react"
import { useAtom } from "jotai"
import toast, { Toaster } from "react-hot-toast"

import {
  chatGPTKeyAtom,
  chatGPTModelAtom,
  useOwnOpenaiKeyAtom,
} from "@/state/config"

const chatGPTModels = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-030",
  "gpt-4",
  "gpt-4-0314",
  "gpt-4-32k",
  "gpt-4-32k-0314",
]

export default function Settings() {
  const [useOwnOpenaiKey, setUseOwnOpenaiKey] = useAtom(useOwnOpenaiKeyAtom)
  const [chatGPTKey, setChatGPTKey] = useAtom(chatGPTKeyAtom)
  const [chatGPTModel, setChatGPTModel] = useAtom(chatGPTModelAtom)
  const [formUseOwnKey, setFormUseOwnKey] = useState(false)
  const [formApiKey, setFormApiKey] = useState("")
  const [formModel, setFormModel] = useState<string | undefined>(undefined)

  useEffect(() => {
    setFormApiKey(chatGPTKey)
    setFormModel(chatGPTModel)
    setFormUseOwnKey(useOwnOpenaiKey)
  }, [chatGPTKey, chatGPTModel, useOwnOpenaiKey])

  const changeApiKeyInput = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    setFormApiKey(e.target.value)
  }
  const changeModelInput = (e: ChangeEvent<HTMLSelectElement>) => {
    e.preventDefault()
    setFormModel(e.target.value)
  }
  const saveSettings = () => {
    setChatGPTKey(formApiKey)
    setChatGPTModel(formModel)
    setUseOwnOpenaiKey(formUseOwnKey)
    toast("Settings saved")
  }

  return (
    <div className="card w-2/3 h-full bg-base-100 shadow-md p-10 rounded-none">
      <div className="card-body">
        <h2 className="card-title">Settings</h2>
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Use your own ChatGPT Key</span>
          </label>
          <input
            type="checkbox"
            className="toggle"
            checked={formUseOwnKey}
            onChange={() => {
              setFormUseOwnKey((isOn) => !isOn)
            }}
          />
          <label className="label">
            <span className="label-text">ChatGPT Api Key</span>
          </label>
          <input
            type="text"
            placeholder="api key"
            className="input input-bordered w-full"
            value={formApiKey}
            onChange={changeApiKeyInput}
            disabled={!formUseOwnKey}
          />
          {/* <label className="label"> !!!!TODO add this when models are usable
            <span className="label-text">ChatGPT model</span>
          </label>
          <select
            className="select select-bordered w-full max-w-xs"
            onChange={(e) => changeModelInput(e)}
            value={formModel || ""}
          >
            <option disabled>Pick a model</option>
            {chatGPTModels.map((model) => {
              return <option key={model}>{model}</option>
            })}
          </select> */}
        </div>
        <div className="card-actions justify-end">
          <button
            className="btn btn-primary active:bg-primary"
            onClick={saveSettings}
          >
            Save
          </button>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
