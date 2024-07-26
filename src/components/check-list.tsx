"use client";
import CheckItem from "./check-item";
import { IoMdRemoveCircle } from "react-icons/io";

interface CheckListProps {
  title: string;
  items: string[];
  isDeletable?: boolean;
  onDelete?: (item: string, index: number) => void;
}

const CheckList = ({ title, items, onDelete, isDeletable }: CheckListProps) => {
  return (
    <div>
      <h2 className="text-sm">{title}</h2>
      <div className="mt-2 flex max-h-[140px] w-full flex-col gap-2 overflow-auto text-xs">
        {items.length === 0 && (
          <span className="text-gray-500">No skills found</span>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            className="flex w-full items-center justify-between gap-1 pr-2"
          >
            <CheckItem>{item}</CheckItem>
            <div>
              {isDeletable && (
                <IoMdRemoveCircle
                  className="cursor-pointer text-gray-400"
                  onClick={() => onDelete?.(item, index)}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckList;
