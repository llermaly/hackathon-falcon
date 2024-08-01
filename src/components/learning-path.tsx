"use client";
import React, { useEffect } from "react";
import CourseCard from "./course-card";
import { api } from "@/trpc/react";
import { toast } from "react-toastify";

import Carousel from "react-multi-carousel";
import { shortenString } from "./new-job";
import Button from "./button";
import useApp from "@/hooks/use-app";
import { IoSaveOutline } from "react-icons/io5";
import { FaClipboard } from "react-icons/fa";
import { FaClipboardCheck } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import CourseChangeCard from "./course-change-card";
import { RecommendationWithCourse } from "@/server/utils/schemas";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 3,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 3,
  },
};

const LearningPath = () => {
  const {
    skills,
    currentSkills,
    futureGoals,
    desirableSkills,
    requiredSkills,
    newJobTitle,
    setSkills,
    setRequiredSkills,
    setDesirableSkills,
    setNewJobTitle,
  } = useApp();

  const queryparams = useSearchParams();

  const router = useRouter();

  const showSaveModal = queryparams.get("show_save_modal") === "true";

  const pathId = queryparams.get("path");

  const saveLearningPath = api.destiny.saveLearningPath.useMutation();

  const learningPath = api.destiny.getLearningPath.useQuery(pathId as string, {
    enabled: !!pathId,
    staleTime: Infinity,
  });

  const getSkillRecommendations =
    api.destiny.getSkillRecommendations.useMutation();

  const [requiredData, setRequiredData] = React.useState<
    RecommendationWithCourse[]
  >([]);

  const [desirableData, setDesirableData] = React.useState<
    RecommendationWithCourse[]
  >([]);

  const [pathUrl, setPathUrl] = React.useState("");

  const [triggerClipboardicon, setTriggerClipboardicon] = React.useState(false);

  const showLoadButton =
    requiredData.length === 0 && desirableData.length === 0;

  const getSkillCourses = api.destiny.getCourseBySkill.useMutation();

  const [editingSkillId, setEditingSkillId] = React.useState("");

  const handleLoadLearningPath = () => {
    if (
      !currentSkills ||
      !futureGoals ||
      currentSkills.trim() === "" ||
      futureGoals.trim() === "" ||
      (requiredSkills.length === 0 && desirableSkills.length === 0)
    ) {
      toast.error(
        "Please complete your current skills and future goals to load a learning path.",
      );
      return;
    }

    getSkillRecommendations.mutate(
      {
        currentSkills,
        futureGoals,
      },
      {
        onSuccess: (data) => {
          setRequiredData(data.requiredSkills);
          setDesirableData(data.desirableSkills);
        },
        onError: (error) => {
          toast.error("Could not retrieve a learning path.");
          console.log({ error });
        },
      },
    );
  };

  const getCompletedPercentage = () => {
    const total = requiredData.length + desirableData.length;
    const completedRequired = requiredData.filter((i) => i.active).length;
    const completedDesirable = desirableData.filter((i) => i.active).length;
    const completed = completedRequired + completedDesirable;
    return Math.round((completed / total) * 100);
  };

  const ClipboardIcon = triggerClipboardicon ? FaClipboardCheck : FaClipboard;

  useEffect(() => {
    if (learningPath.data) {
      setRequiredData(learningPath.data.learningPath.requiredData);
      setDesirableData(learningPath.data.learningPath.desirableData);
      setNewJobTitle(learningPath.data.newJobTitle);
      setSkills(learningPath.data.currentSkills);
      setRequiredSkills(learningPath.data.newJobRequiredSkills);
      setDesirableSkills(learningPath.data.newJobDesirableSkills);
    }
  }, [learningPath.data]);

  useEffect(() => {
    if (learningPath.isError) {
      toast.error("Could not retrieve a learning path with the given id.");
      router.push("/");
    }
  }, [learningPath.isError]);

  const handleSaveLearningPath = () => {
    saveLearningPath.mutate(
      {
        currentSkills: skills,
        newJobDesirableSkills: desirableSkills,
        newJobRequiredSkills: requiredSkills,
        learningPath: JSON.stringify({
          requiredData,
          desirableData,
        }),
        newJobTitle,
        id: learningPath.data?.id,
      },
      {
        onSuccess: (data) => {
          toast.success("Learning path saved successfully");
          if (!pathId) {
            router.push(`?path=${data.id}`);
            setPathUrl(window?.location?.href + "?path=" + data?.id);
            (document as any).getElementById("saved_path_modal")?.showModal();
          }
        },
        onError: (error) => {
          toast.error("Could not save learning path");
          console.log({ error });
        },
      },
    );
  };

  if (showLoadButton) {
    return (
      <>
        {learningPath.isLoading && (
          <div className="backdrop">
            <div className="flex flex-col items-center text-white">
              <div className="loader" />
            </div>
          </div>
        )}
        <div className="flex h-full w-full items-center justify-center rounded-md bg-blue-100 p-4">
          <Button
            className="btn btn-primary text-white"
            onClick={handleLoadLearningPath}
            isLoading={getSkillRecommendations.isPending}
          >
            Load learning path
          </Button>
        </div>
      </>
    );
  }

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="block text-sm font-semibold uppercase text-blue-600">
            Learning path
          </span>
          <Button
            className="btn btn-primary btn-xs text-white"
            onClick={handleSaveLearningPath}
            isLoading={saveLearningPath.isPending}
          >
            {pathId ? "Save changes" : "Create and share"}

            <IoSaveOutline className="text-white" />
          </Button>
        </div>
        <dialog id="saved_path_modal" className="modal">
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
          <div className="modal-box">
            <h3 className="text-lg font-bold">
              Learning path saved succesfully!
            </h3>
            <div className="mb-2 py-2">
              <p>You can now share your learning path with the following url</p>
              <div className="mt-2 flex items-center justify-between rounded-md bg-gray-100 px-4 py-1">
                <a href={pathUrl} className="text-primary">
                  {shortenString(pathUrl, 40)}
                </a>
                <ClipboardIcon
                  className="cursor-pointer"
                  onClick={async () => {
                    await navigator.clipboard.writeText(pathUrl);
                    setTriggerClipboardicon(true);
                    toast.success("Copied to clipboard");
                    setTimeout(() => {
                      setTriggerClipboardicon(false);
                    }, 2000);
                  }}
                />
              </div>
            </div>
            <div className="modal-action mt-0">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button
                  className="btn"
                  onClick={() => router.push(`?path=${pathId}`)}
                >
                  Close
                </button>
              </form>
            </div>
          </div>
        </dialog>
        <div className="flex items-center gap-2">
          <span className="text-sm font-light text-primary">Completed</span>
          <div
            className="radial-progress border-primary text-[10px] text-primary"
            style={
              { "--value": getCompletedPercentage(), "--size": "2.5rem" } as any
            }
            role="progressbar"
          >
            {getCompletedPercentage()}%
          </div>
        </div>
      </div>

      <div className="mt-4 w-full rounded-md bg-gray-100 px-2 pb-4 pt-4">
        <div className="overflow-x-auto">
          <ul className="steps w-full pb-2">
            {[...requiredData, ...desirableData].map((item, i) => (
              <li
                key={i}
                data-content={item.active ? "✓" : i + 1}
                className={`step mx-1 min-w-[8rem] text-xs font-semibold text-black ${item.active ? "step-primary" : ""}`}
              >
                <div className="tooltip z-50" data-tip={item.skill}>
                  {" "}
                  {shortenString(item.skill, 10)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-2 py-2">
          <span className="w-[160px] text-xl text-gray-500">
            Required ({requiredData.length})
          </span>{" "}
          <div className="h-[2px] w-full bg-gray-200" />
        </div>

        <Carousel responsive={responsive}>
          {requiredData.length === 0 && (
            <div className="w-full text-gray-400">No required skills</div>
          )}
          {requiredData.map((item, i) => (
            <div key={i}>
              <CourseCard
                isActive={item.active}
                item={item}
                onClickActive={(item) => {
                  setRequiredData((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, active: !i.active } : i,
                    ),
                  );
                }}
                onClickRemove={(item) => {
                  setRequiredData((prev) =>
                    prev.filter((i) => i.id !== item.id),
                  );
                }}
                onClickChange={(item) => {
                  setEditingSkillId(item.id);

                  getSkillCourses.mutate({ skill: item.skill, id: item.id });

                  (document as any)
                    .getElementById("change_course_modal")
                    .showModal();
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>
      <div className="mt-2">
        <div className="flex items-center gap-2 py-2">
          <span className="w-[160px] text-xl text-gray-500">
            Desirable ({desirableData.length})
          </span>
          <div className="h-[2px] w-full bg-gray-200" />
        </div>

        <Carousel responsive={responsive}>
          {desirableData.length === 0 && (
            <div className="w-full text-gray-400">No desirable skills</div>
          )}
          {desirableData.map((item, i) => (
            <div key={i}>
              <CourseCard
                item={item}
                isActive={item.active}
                isCore={false}
                onClickActive={(item) => {
                  setDesirableData((prev) =>
                    prev.map((i) =>
                      i.id === item.id ? { ...i, active: !i.active } : i,
                    ),
                  );
                }}
                onClickRemove={(item) => {
                  setDesirableData((prev) =>
                    prev.filter((i) => i.id !== item.id),
                  );
                }}
                onClickChange={(item) => {
                  setEditingSkillId(item.id);

                  getSkillCourses.mutate({ skill: item.skill, id: item.id });

                  (document as any)
                    .getElementById("change_course_modal")
                    .showModal();
                }}
              />
            </div>
          ))}
        </Carousel>
      </div>

      <dialog id="change_course_modal" className="modal">
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
        <div className="modal-box w-full max-w-4xl">
          <h3 className="mb-4 text-lg font-bold">
            Select your favorite course
          </h3>
          {getSkillCourses.isPending && (
            <div className="flex gap-8">
              <div className="skeleton h-[295px] w-[250px]"></div>
              <div className="skeleton h-[295px] w-[250px]"></div>
              <div className="skeleton h-[295px] w-[250px]"></div>
            </div>
          )}
          {getSkillCourses.data && getSkillCourses.data.length > 0 && (
            <Carousel responsive={responsive}>
              {getSkillCourses.data?.map((c) => (
                <CourseChangeCard
                  key={c.id}
                  item={c}
                  onClickSelect={(item) => {
                    setRequiredData((prev) =>
                      prev.map((p) =>
                        p.id === item.id ? { ...p, course: item.course } : p,
                      ),
                    );

                    setDesirableData((prev) =>
                      prev.map((p) =>
                        p.id === item.id ? { ...p, course: item.course } : p,
                      ),
                    );

                    (document as any)
                      .getElementById("change_course_modal")
                      .close();
                  }}
                />
              ))}
            </Carousel>
          )}
        </div>
      </dialog>
    </div>
  );
};

export default LearningPath;
