import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { shortenString } from "./new-job";
import { TbTrashXFilled } from "react-icons/tb";
import { MdChangeCircle } from "react-icons/md";
import { RecommendationWithCourse } from "@/server/utils/schemas";

const CourseCard = ({
  isActive,
  isCore = true,
  item,
  onClickActive,
  onClickRemove,
  onClickChange,
}: {
  item: RecommendationWithCourse;
  isActive?: boolean;
  isCore?: boolean;
  onClickActive?: (item: RecommendationWithCourse) => void;
  onClickRemove?: (item: RecommendationWithCourse) => void;
  onClickChange?: (item: RecommendationWithCourse) => void;
}) => {
  const bg = isActive
    ? isCore
      ? "bg-blue-600"
      : "bg-neutral-900"
    : "bg-gray-100";

  const text = isActive ? "text-white" : "text-black";
  const textSecondary = isActive ? "text-white" : "text-gray-500";

  return (
    <div className={`h-[295px] w-[250px] rounded-md p-2.5 ${bg}`}>
      <div className="relative">
        <FaExternalLinkAlt
          onClick={() => window.open(item.course.url, "_blank")}
          className="absolute left-2 top-2 h-4 cursor-pointer text-white"
        />
        <img src={item.course.image} className="rounded-md" />

        <div
          data-tip={isActive ? "Completed" : "Uncompleted"}
          className={`tooltip absolute -bottom-3 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full ${isActive ? "bg-green-500" : "bg-gray-200"}`}
          onClick={() => onClickActive?.(item)}
        >
          <FaCheck className="p text-white" />
        </div>
      </div>
      <div className="flex h-[140px] flex-col justify-between pt-3">
        <div>
          <div
            className={`tooltip text-sm font-semibold ${text}`}
            data-tip={item.skill}
          >
            {shortenString(item.skill, 25)}
          </div>
          <p className={`text-xs ${textSecondary} mt-1 font-light`}>
            {shortenString(item.description, 150)}
          </p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className={`flex items-center ${text}`}>
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
          </div>
          <div className="flex items-center gap-2">
            <div className="tooltip" data-tip="Change">
              <MdChangeCircle
                onClick={() => onClickChange?.(item)}
                className={`h-4 w-4 cursor-pointer ${text}`}
              />
            </div>
            <div className="tooltip" data-tip="Remove">
              <TbTrashXFilled
                onClick={() => onClickRemove?.(item)}
                className={`h-4 w-4 cursor-pointer ${text}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
