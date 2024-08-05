import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { shortenString } from "./new-job";
import { RecommendationWithCourse } from "@/server/utils/schemas";

const CourseChangeCard = ({
  isActive,
  isCore = true,
  item,
  onClickSelect,
}: {
  item: RecommendationWithCourse;
  isActive?: boolean;
  isCore?: boolean;
  onClickSelect?: (item: RecommendationWithCourse) => void;
}) => {
  const bg = isActive
    ? isCore
      ? "bg-blue-600"
      : "bg-neutral-900"
    : "bg-gray-100";

  const text = isActive ? "text-white" : "text-black";
  const textSecondary = isActive ? "text-white" : "text-gray-500";

  return (
    <div
      onClick={() => onClickSelect?.(item)}
      className={`h-[295px] w-[250px] cursor-pointer rounded-md p-2.5 ${bg}`}
    >
      <div className="relative">
        <FaExternalLinkAlt
          onClick={() => window.open(item.course.url, "_blank")}
          className="absolute left-2 top-2 h-4 cursor-pointer text-white"
        />
        <img src={item?.course?.image} className="rounded-md" />
      </div>
      <div className="flex h-[140px] flex-col justify-between pt-3">
        <div>
          <div
            className={`tooltip text-sm font-semibold ${text}`}
            data-tip={item.skill}
          >
            {shortenString(item.skill, 25)}
          </div>
          <p
            className={`text-xs ${textSecondary} mt-1 font-light`}
            dangerouslySetInnerHTML={{
              __html: shortenString(item.description, 150),
            }}
          ></p>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className={`flex items-center ${text}`}>
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
            <FaStar className="h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseChangeCard;
