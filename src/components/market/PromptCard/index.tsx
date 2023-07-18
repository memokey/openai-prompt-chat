import { PromptIcon } from "@/components/common/Icons"
import { MarketPrompt, Tag } from "@prisma/client"
import Image from "next/image"

interface IPromptCard {
  prompt: MarketPrompt & {
    tags: Tag[]
  }
  action: () => void
}

function PromptCard({ prompt, action }: IPromptCard) {
  return (
    <div
      className="relative w-full bg-[#020D27] z-0 rounded-[24px] p-2 h-[175px] cursor-pointer max-w-[220px]"
      key={prompt.address}
      onClick={() => action()}
    >
      <div className="flex items-center bg-[#020D27] text-white px-3 py-2 rounded-[24px]">
        <PromptIcon />&nbsp;
        Prompt
      </div>
      <div className="flex flex-col justify-between h-[120px] p-4">
        <div className="flex justify-between mb-2">
          <div className="font-semibold text-white text-[16px]">
            {prompt.name}
          </div>
          <div className="text-[#7D7D7D] font-light text-[14px]">
            {'$'}{prompt.price}
          </div>
        </div>
        <div className="flex gap-2">
          {prompt.tags.map((tag, index) => (
            <div className="bg-[#DCD9FC] rounded-[8px] text-[#5B4EF1] px-3 py-1 text-[12px]" key={index}>
              {tag.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PromptCard;