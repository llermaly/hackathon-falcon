"use client";
import { RecommendationWithCourse } from "@/server/api/routers/post";
import { api } from "@/trpc/react";
import React from "react";
import { toast } from "react-toastify";

const Recommendation = () => {
  const getSkillRecommendations =
    api.post.getSkillRecommendations.useMutation();
  const [data, setData] = React.useState<RecommendationWithCourse[]>([]);

  const getSkillCourses = api.post.getCourseBySkill.useMutation();

  const [currentSkills, setCurrentSkills] = React.useState("HTML and CSS");
  const [futureGoals, setFutureGoals] = React.useState("Full-stack developer");

  const [editingCourse, setEditingCourse] = React.useState("");

  const handleSubmit = async () => {
    getSkillRecommendations.mutate(
      {
        currentSkills,
        futureGoals,
      },
      {
        onSuccess: (data) => {
          setData(data);
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
      {data?.map((r, i) => (
        <div
          key={r.order}
          className="card mt-4 bg-base-100 shadow-xl lg:card-side"
        >
          <img src={r.course.image} alt={r.skill} />
          <div className="card-body bg-white">
            <h2 className="card-title text-black">
              {i + 1}. {r.skill}
            </h2>
            <p>{r.description}</p>
            <div>
              <p>Why {r.skill}?</p>
              <p>{r.order_justification}</p>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setData((prev) => prev.filter((p) => p.id !== r.id));
                }}
              >
                Remove
              </button>
              <button
                className="btn"
                onClick={() => {
                  setEditingCourse(r.id);

                  getSkillCourses.mutate({ skill: r.skill });

                  (document as any).getElementById("my_modal_1").showModal();
                }}
              >
                Change
              </button>
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

      <dialog id="my_modal_1" className="modal">
        <div className="modal-box w-full max-w-7xl">
          <h3 className="text-lg font-bold">Select new course</h3>
          {getSkillCourses.data?.map((c) => (
            <div
              key={c.url}
              className="card mt-4 bg-base-100 shadow-xl lg:card-side"
            >
              <img src={c.image} alt={c.title} />
              <div className="card-body bg-white">
                <h2 className="card-title text-black">{c.title}</h2>
                <p>{c.headline}</p>
                <div className="card-actions justify-end">
                  <button
                    onClick={() => {
                      setData((prev) =>
                        prev.map((p) =>
                          p.course.url === editingCourse
                            ? { ...p, course: c }
                            : p,
                        ),
                      );

                      (document as any).getElementById("my_modal_1").close();
                    }}
                    className="btn btn-secondary"
                  >
                    Select
                  </button>
                  <button
                    onClick={() => window.open(c.url, "_blank")}
                    className="btn btn-primary"
                  >
                    Go to course
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn">Close</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default Recommendation;
