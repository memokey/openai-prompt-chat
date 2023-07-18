import { LineWobble } from "@uiball/loaders"

interface IStepInfo {
  message?: string
}

export function StepInfo({ message }: IStepInfo) {
  return (
    <div className="flex flex-col items-center content-center w-full">
      <div className="p-5">{message}</div>
      <div className="p-10">
        <LineWobble />
      </div>
    </div>
  )
}
