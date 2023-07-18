import { createPortal } from "react-dom"
import { XMarkIcon } from "@heroicons/react/20/solid"

interface IModal {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, onClose, children }: IModal) {
  if (typeof document !== "undefined") {
    return createPortal(
      <div
        className={`fixed inset-0 ${
          open ? "" : "pointer-events-none"
        } flex items-center justify-center`}
      >
        {/* backdrop */}
        <div
          className={`fixed inset-0 bg-black ${
            open ? "opacity-50" : "pointer-events-none opacity-0"
          } transition-opacity duration-50 ease-in-out`}
          onClick={onClose}
        />

        {/* content */}
        <div
          className={`absolute z-50 rounded-md w-1/2 pt-8 bg-white shadow-lg p-6 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          } transition-opacity duration-10 ease-in-out`}
        >
          <div>
            <XMarkIcon
              className="absolute h-5 w-5 hover:cursor-pointer top-2 right-2"
              onClick={onClose}
            />
          </div>
          {children}
        </div>
      </div>,
      document.body
    )
  } else {
    return null
  }
}
