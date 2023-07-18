import { useAtom } from "jotai"
import { selectedPageAtom, page } from "@/state/pages"
import {
  Cog6ToothIcon,
  BuildingStorefrontIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
} from "@heroicons/react/20/solid"

function NavMenu() {
  const [selected, SetSelected] = useAtom(selectedPageAtom)
  return (
    <ul className="menu">
      <li>
        <span
          className={`${selected === page.CHAT && "bg-primary"}`}
          onClick={() => SetSelected(page.CHAT)}
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" stroke="currentColor" />
        </span>
      </li>
      <li>
        <span
          className={`${selected === page.LIBRARY && "bg-primary"}`}
          onClick={() => SetSelected(page.LIBRARY)}
        >
          <BookOpenIcon className="h-5 w-5" stroke="currentColor" />
        </span>
      </li>
      <li>
        <span
          className={`${selected === page.MARKET && "bg-primary"}`}
          onClick={() => SetSelected(page.MARKET)}
        >
          <BuildingStorefrontIcon className="h-5 w-5" stroke="currentColor" />
        </span>
      </li>
      <li>
        <span
          className={`${selected === page.SETTINGS && "bg-primary"}`}
          onClick={() => SetSelected(page.SETTINGS)}
        >
          <Cog6ToothIcon className="h-5 w-5" stroke="currentColor" />
        </span>
      </li>
    </ul>
  )
}

export default function NavBar() {
  return (
    <div className="flex flex-col flex-none justify-between items-center">
      <NavMenu />
    </div>
  )
}
