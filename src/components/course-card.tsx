import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaRegStar, FaStar } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { RecommendationWithCourse } from "@/server/api/routers/post";
import { shortenString } from "./new-job";

const CourseCard = ({
  isActive,
  isCore = true,
  item,
  onClickActive,
}: {
  item: RecommendationWithCourse;
  isActive?: boolean;
  isCore?: boolean;
  onClickActive?: (item: RecommendationWithCourse) => void;
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
        <div>
          <div className={`mt-2 flex items-center ${text}`}>
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaRegStar className="h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
