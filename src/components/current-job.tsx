"use client";
import React, { useEffect } from "react";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { api } from "@/trpc/react";
import CheckList from "./check-list";
import { FaCirclePlus } from "react-icons/fa6";
import { toast } from "react-toastify";
import Button from "./button";
import useApp from "@/hooks/use-app";

const CurrentJob = () => {
  const extractSkills = api.post.extractSkills.useMutation();

  const [file, setFile] = React.useState<File | null>(null);
  const [isLoadingPDF, setIsLoadingPDF] = React.useState(false);

  const { skills, setSkills } = useApp();

  const [extractMode, setExtractMode] = React.useState(false);

  const [newSkillsText, setNewSkillsText] = React.useState("");

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      setIsLoadingPDF(true);

      const blob = new Blob([file], { type: "application/pdf" });
      const loader = new WebPDFLoader(blob);

      const docs = await loader.load();

      const text = docs.map((doc) => doc.pageContent).join("\n\n");

      extractSkills.mutate(
        { text },
        {
          onSuccess: (data) => {
            setSkills(data.skills);
          },
          onSettled: () => {
            setIsLoadingPDF(false);
          },
        },
      );
    }
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
            setSkills((prev) => [...prev, ...data.skills]);
            setNewSkillsText("");
            (document as any).getElementById("add_skill_modal").close();
          },
        },
      );
    } else {
      setSkills((prev) => [...prev, ...newSkillsText.split("\n")]);
      setNewSkillsText("");
      (document as any).getElementById("add_skill_modal").close();
    }
  };

  return (
    <div className="flex w-full gap-4">
      <label>
        <input
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={".pdf"}
        />
        <div className="flex h-48 w-[150px] cursor-pointer items-center justify-center rounded-md border bg-primary p-2 text-center text-xs text-white">
          <div className="max-w-[130px] break-words px-4">
            {file ? (
              isLoadingPDF ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                file.name
              )
            ) : (
              "Click to extract skills from PDF"
            )}
          </div>
        </div>
      </label>
      <div className="w-full">
        <div className="h-[190px] w-full">
          <CheckList
            title="Your current skills"
            items={skills}
            isDeletable
            onDelete={(item, i) => {
              setSkills((prev) => prev.filter((_, index) => index !== i));
            }}
          />
          <div
            onClick={() =>
              (document as any).getElementById("add_skill_modal").showModal()
            }
            className="mt-2 flex cursor-pointer items-center gap-1 text-xs"
          >
            Add more
            <FaCirclePlus className="text-primary" />
          </div>
        </div>

        <dialog id="add_skill_modal" className="modal">
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
                isLoading={extractSkills.isPending}
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
        {/* <div className="flex items-center gap-4 text-xs">
          <div className="mt-4 flex items-center gap-1">
            <FiEye className="h-5 w-5" />
            <span>View</span>
          </div>
          <div className="mt-4 flex items-center gap-1">
            <img src="circles.svg" className="h-5 w-5" alt="circles" />
            <span className="text-blue-600">Matches</span>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CurrentJob;
