import { RecommendationWithCourse } from "@/server/api/routers/post";
import { createContext, Dispatch, SetStateAction, useState } from "react";

interface AppContextProps {
  skills: string[];
  setSkills: Dispatch<SetStateAction<string[]>>;
  requiredSkills: string[];
  setRequiredSkills: Dispatch<SetStateAction<string[]>>;
  desirableSkills: string[];
  setDesirableSkills: Dispatch<SetStateAction<string[]>>;
  newJobTitle: string;
  setNewJobTitle: Dispatch<SetStateAction<string>>;
  requiredData: RecommendationWithCourse[];
  setRequiredData: Dispatch<SetStateAction<RecommendationWithCourse[]>>;
  desirableData: RecommendationWithCourse[];
  setDesirableData: Dispatch<SetStateAction<RecommendationWithCourse[]>>;
  futureGoals: string;
  currentSkills: string;
}

export const AppContext = createContext({} as AppContextProps);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [skills, setSkills] = useState<string[]>([]);

  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [desirableSkills, setDesirableSkills] = useState<string[]>([]);

  const [newJobTitle, setNewJobTitle] = useState("Your new job name");

  const [requiredData, setRequiredData] = useState<RecommendationWithCourse[]>(
    [],
  );

  const [desirableData, setDesirableData] = useState<
    RecommendationWithCourse[]
  >([]);

  const futureGoals = `Job title: ${newJobTitle}\nRequired skills:\n${requiredSkills.join(
    "\n",
  )}\nDesirable skills:\n${desirableSkills.join("\n")}`;

  const currentSkills = skills.join("\n");

  return (
    <AppContext.Provider
      value={{
        skills,
        setSkills,
        requiredSkills,
        setRequiredSkills,
        desirableSkills,
        setDesirableSkills,
        newJobTitle,
        setNewJobTitle,
        requiredData,
        setRequiredData,
        desirableData,
        setDesirableData,
        futureGoals,
        currentSkills,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
