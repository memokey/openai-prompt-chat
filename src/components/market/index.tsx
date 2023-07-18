import { useState } from "react"
import { trpc } from "@/utils/trpc"
import { MarketPrompt, Tag } from "@prisma/client"
import Modal from "@/components/common/Modal"
import { BuyPrompt } from "./BuyPrompt"
import PromptCard from "./PromptCard"
import Image from "next/image"
import PromptType from "./PromptType"

export default function Market() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sellModalOpen, setSellModalOpen] = useState(false)
  const [selectedPrompt, setSelectedPrompt] = useState<
    MarketPrompt | undefined
  >(undefined)

  const { data: marketPrompts } = trpc.marketPrompt.getAll.useQuery()

  const allTags = marketPrompts?.flatMap((prompts) => prompts.tags)
  const tagsByKey = allTags?.reduce((acc, value) => {
    acc = {
      ...acc,
      [value.name]: acc[value.name] !== undefined ? acc[value.name] + 1 : 1,
    }
    return acc
  }, {} as { [s: string]: number })

  const promptsFilteredByTags = marketPrompts?.filter((prompt) =>
    selectedTags.length === 0
      ? marketPrompts
      : selectedTags.reduce((acc, value) => {
          if (prompt.tags.map((tag) => tag.name).includes(value)) return true
          return acc
        }, false)
  )

  return (
    <div className="flex gap-[36px] w-full bg-[#0B081B] pt-5">
      <div className="w-[342px] bg-[#020D27] p-6 font-semibold rounded-r-[24px]">
        <div className="text-[#BFBFBF] text-[23px] mb-2">
          Tags
        </div>
        <div className="mb-10">
          {tagsByKey &&
              Object.entries(tagsByKey)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([tag, number], index) => (
              <PromptType 
                key={index}
                title={tag}
                count={number}
                checked={selectedTags.includes(tag)}
                onChange={() => {
                  setSelectedTags((tags) => {
                    return tags.includes(tag)
                      ? tags.filter((tagInlist) => tag !== tagInlist)
                      : [...tags, tag]
                  })
                }}
              />
            ))}
          </div>
          <div className="text-[#BFBFBF] text-[23px] mb-2">
            Collections
          </div>
          <div>
            <PromptType 
              title={"Curated by Mindgem"}
              count={24}
              checked={false}
              onChange={() => {}}
            />
          </div>
      </div>
      <div className="">
        <div>
          <Image 
            src={'/images/marketplace/marketplacebanner.png'}
            className="rounded-[24px] mb-6"
            alt="banner"
            width={952}
            height={168}
          />
        </div>
        <div className="h-[calc(100vh-8rem)] w-[100%] flex gap-6 flex-row flex-wrap items-start overflow-y-auto">
          {promptsFilteredByTags?.map((prompt, index) => (
            <PromptCard
              key={index}
              prompt={prompt}
              action={() => {
                setSelectedPrompt(prompt)
                setSellModalOpen(true)
              }}
            />
          ))}
        </div>
      </div>
      <Modal
        open={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false)
          setSelectedPrompt(undefined)
        }}
      >
        {selectedPrompt && (
          <BuyPrompt selectedPrompt={selectedPrompt} close={sellModalOpen} />
        )}
      </Modal>
    </div>
  )
}
