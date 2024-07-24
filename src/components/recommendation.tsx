"use client";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "react-toastify";

const Recommendation = () => {
  const getSkillRecommendations =
    api.post.getSkillRecommendations.useMutation();

  const [currentSkills, setCurrentSkills] = React.useState("HTML and CSS");
  const [futureGoals, setFutureGoals] = React.useState("Full-stack developer");

  const handleSubmit = async () => {
    getSkillRecommendations.mutate(
      {
        currentSkills,
        futureGoals,
      },
      {
        onSuccess: () => {
          toast.success("Recommendations retrieved successfully.");
        },
        onError: (error) => {
          toast.error("Could not retrieve recommendations.");
          console.log({ error });
        },
      },
    );
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-8">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Your current skills</span>
          </div>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="HTML and CSS"
            value={currentSkills}
            onChange={(e) => setCurrentSkills(e.target.value)}
          ></textarea>
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Where you want to be</span>
          </div>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="Full-stack developer"
            value={futureGoals}
            onChange={(e) => setFutureGoals(e.target.value)}
          ></textarea>
        </label>
      </div>

      <button
        disabled={getSkillRecommendations.isPending}
        className="btn btn-primary mt-4"
        onClick={handleSubmit}
      >
        Get career path
      </button>
      {getSkillRecommendations.data?.map((r) => (
        <div
          key={r.order}
          className="card mt-4 bg-base-100 shadow-xl lg:card-side"
        >
          <img src={r.course.image} alt={r.skill} />
          <div className="card-body bg-white">
            <h2 className="card-title text-black">
              {r.order}. {r.skill}
            </h2>
            <p>{r.description}</p>
            <div>
              <p>Why {r.skill}?</p>
              <p>{r.order_justification}</p>
            </div>
            <div className="card-actions justify-end">
              <button
                onClick={() => window.open(r.course.url, "_blank")}
                className="btn btn-primary"
              >
                Go to course
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Recommendation;
