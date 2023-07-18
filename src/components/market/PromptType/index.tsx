import React from "react";

export type PromptAType = {
  checked: boolean;
  title: string;
  count: number;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

const PromptType = (props: PromptAType) => {
  return (
    <div className="flex justify-between">
      <label className="label cursor-pointer">
        <input 
          type="checkbox"
          className="checkbox border-[1.4px] border-white"
          onChange={props.onChange}
        />
        <span className="label-text text-[#BFBFBF] text-[16px] font-normal ml-2">{props.title}</span> 
      </label>
      <div className="flex items-center">
        <label className="rounded-[8px] bg-[#DCD9FC] px-2.5 py-0.5 text-[#5B4EF1] text-[14px]">{props.count}</label>
      </div>
    </div>
  );

}

export default PromptType;