import { MouseEvent } from "react"
import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { DotsVerticalIcon } from "@radix-ui/react-icons"

interface IDropDown {
  options: {
    text: string
    action: () => void
  }[]
}

export default function DropDown({ options }: IDropDown) {
  const performAction = (
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    cb: () => void
  ) => {
    e.stopPropagation()
    cb()
  }
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="IconButton p-2 outline-none"
          aria-label="Customise options"
        >
          <DotsVerticalIcon />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="dropdown-content menu p-2 shadow bg-base-100 w-40 rounded-sm"
          sideOffset={5}
        >
          {options.map((option) => {
            return (
              <DropdownMenu.Item
                key={option.text}
                className="hover:cursor-pointer hover:bg-primary/50 p-1 rounded-sm outline-none"
                onClick={(e) => performAction(e, option.action)}
              >
                {option.text}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
