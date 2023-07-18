import { ChangeEvent } from "react"

interface IPromptEdit {
  title: string
  text: string
  updateTitle: (e: ChangeEvent<HTMLInputElement>) => void
  updateText: (e: ChangeEvent<HTMLTextAreaElement>) => void
  savePrompt: () => void
}

export default function PromptEdit({
  title,
  text,
  updateTitle,
  updateText,
  savePrompt,
}: IPromptEdit) {
  return (
    <>
      <input
        type="text"
        placeholder="title"
        className="input input-bordered rounded-md w-full"
        value={title}
        onChange={(e) => updateTitle(e)}
      />
      <textarea
        className="textarea textarea-bordered w-full resize-none rounded-md mt-2 h-[6rem]"
        placeholder="Your prompt"
        value={text}
        onChange={updateText}
      />
      <div className="w-full flex flex-row-reverse">
        <button className="btn btn-primary mt-1" onClick={savePrompt}>
          Save
        </button>
      </div>
    </>
  )
}
