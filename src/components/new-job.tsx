"use client";
import React, { useEffect } from "react";
import { api } from "@/trpc/react";
import CheckList from "./check-list";
import { FaCirclePlus } from "react-icons/fa6";
import { toast } from "react-toastify";
import { BsPencilSquare } from "react-icons/bs";
import { GrUploadOption } from "react-icons/gr";
import Button from "./button";
import useApp from "@/hooks/use-app";

export const shortenString = (str: string, maxLen: number) => {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + "...";
};

const NewJob = () => {
  const extractSkills = api.destiny.extractSkills.useMutation();

  const extractSkillsDetailed = api.destiny.extractSkillsDetailed.useMutation();

  const [extractMode, setExtractMode] = React.useState(false);

  const [newJobText, setNewJobText] = React.useState("");

  const {
    requiredSkills,
    setRequiredSkills,
    desirableSkills,
    setDesirableSkills,
    newJobTitle,
    setNewJobTitle,
  } = useApp();

  const [isEditing, setIsEditing] = React.useState(false);

  const [newSkillsText, setNewSkillsText] = React.useState("");

  const [newSkillType, setNewSkillType] = React.useState<
    "required" | "desirable" | ""
  >("");

  const handleLoadNewJob = () => {
    if (!newJobText || newJobText.trim() === "") {
      toast.error("Please enter the job description");
      return;
    }

    extractSkillsDetailed.mutate(
      { text: newJobText },
      {
        onSuccess: (data) => {
          setRequiredSkills((prev) => [...prev, ...data.required_skills]);
          setDesirableSkills((prev) => [...prev, ...data.desirable_skills]);
          setNewJobTitle(data.job_title);
          setNewJobText("");
          (document as any).getElementById("load_new_job_modal").close();
        },
      },
    );
  };

  const handleAddNewSkill = () => {
    if (!newSkillsText || newSkillsText.trim() === "") {
      toast.error("Please enter a skill");
      return;
    }

    if (extractMode) {
      extractSkills.mutate(
        { text: newSkillsText },
        {
          onSuccess: (data) => {
            if (newSkillType === "desirable") {
              setDesirableSkills((prev) => [...prev, ...data.skills]);
            } else {
              setRequiredSkills((prev) => [...prev, ...data.skills]);
            }
            setNewSkillsText("");
            (document as any).getElementById("add_new_job_skill_modal").close();
          },
        },
      );
    } else {
      if (newSkillType === "desirable") {
        setDesirableSkills((prev) => [...prev, ...newSkillsText.split("\n")]);
      } else {
        setRequiredSkills((prev) => [...prev, ...newSkillsText.split("\n")]);
      }
      (document as any).getElementById("add_new_job_skill_modal").close();
      setNewSkillsText("");
    }
  };

  return (
    <div className="my-4 min-h-[350px] rounded-md bg-blue-50 px-3 pb-4 pt-2">
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="block text-sm">New position</span>
        <button
          onClick={() =>
            (document as any).getElementById("load_new_job_modal").showModal()
          }
          className="btn btn-primary btn-xs text-white"
        >
          <span className="text-xs">Load</span>
          <GrUploadOption className="text-white" />
        </button>
      </div>
      <dialog id="load_new_job_modal" className="modal">
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
        <div className="modal-box">
          <h3 className="text-lg font-bold">Load new position</h3>
          <textarea
            value={newJobText}
            onChange={(e) => setNewJobText(e.target.value)}
            placeholder="Paste the job description here and we will extract the skills for you"
            className="mt-4 w-full rounded-md border p-2"
            rows={5}
          />
          <div className="modal-action mt-0">
            <Button
              className="btn btn-primary text-white"
              onClick={handleLoadNewJob}
              isLoading={extractSkillsDetailed.isPending}
            >
              Submit
            </Button>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex h-[36px] items-center justify-between gap-2">
          {isEditing ? (
            <input
              type="text"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              className="max-w-[300px] rounded-md bg-transparent text-xl font-bold text-black outline-none"
              autoFocus
            />
          ) : (
            <h3
              className="tooltip max-w-[300px] break-words text-xl font-bold text-black"
              data-tip={newJobTitle}
            >
              {shortenString(newJobTitle, 25)}
            </h3>
          )}

          <div className="tooltip" data-tip={isEditing ? "Save" : "Edit"}>
            <BsPencilSquare
              className={`mt-1 cursor-pointer ${isEditing ? "text-primary" : "text-gray-400"}`}
              onClick={() => setIsEditing((prev) => !prev)}
            />
          </div>
        </div>

        <CheckList
          title="Job required skills"
          items={requiredSkills}
          isDeletable
          onDelete={(item, i) => {
            setRequiredSkills((prev) => prev.filter((_, index) => index !== i));
          }}
        />
        <div
          onClick={() => {
            setNewSkillType("required");
            (document as any)
              .getElementById("add_new_job_skill_modal")
              .showModal();
          }}
          className="mt-1 flex cursor-pointer items-center gap-1 text-xs"
        >
          Add more
          <FaCirclePlus className="text-primary" />
        </div>
        <CheckList
          title="Job desirable skills"
          items={desirableSkills}
          isDeletable
          onDelete={(item, i) => {
            setDesirableSkills((prev) =>
              prev.filter((_, index) => index !== i),
            );
          }}
        />
        <div
          onClick={() => {
            setNewSkillType("desirable");
            (document as any)
              .getElementById("add_new_job_skill_modal")
              .showModal();
          }}
          className="mt-1 flex cursor-pointer items-center gap-1 text-xs"
        >
          Add more
          <FaCirclePlus className="text-primary" />
        </div>
        <dialog id="add_new_job_skill_modal" className="modal">
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
          <div className="modal-box">
            <h3 className="text-lg font-bold">Add skill</h3>
            <div className="py-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="toggle"
                  checked={extractMode}
                  onChange={(e) => setExtractMode(e.target.checked)}
                />
                <div
                  className="tooltip"
                  data-tip="Analyze text and extract skills "
                >
                  Extract mode
                </div>
              </div>
              <textarea
                value={newSkillsText}
                onChange={(e) => setNewSkillsText(e.target.value)}
                placeholder="Type a skill per line here or enable extract mode and just write/paste your text describing the skills and we will extract them for you"
                className="mt-4 w-full rounded-md border p-2"
                rows={5}
              />
            </div>
            <div className="modal-action mt-0">
              <Button
                className="btn btn-primary text-white"
                onClick={handleAddNewSkill}
                isLoading={
                  extractSkills.isPending || extractSkillsDetailed.isPending
                }
              >
                Submit
              </Button>
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn">Cancel</button>
              </form>
            </div>
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default NewJob;
