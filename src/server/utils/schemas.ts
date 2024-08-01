import { z } from "zod";

export const skillRecommendationSchema = z.object({
  skill: z.string().describe("The recommended skill"),
  description: z.string().describe("The description of the skill"),
  order: z
    .number()
    .describe("The order this skill should be learned in")
    .default(0),
});

export const skillsRecommendationSchema = z.object({
  required_skills: z
    .array(skillRecommendationSchema)
    .describe("An array of the recommended skills"),
  desirable_skills: z
    .array(skillRecommendationSchema)
    .describe("An array of the desirable skills"),
});

export const extractSkillsSchema = z.object({
  skills: z.array(z.string().describe("Skill")).describe("An array of skills"),
});

export const extractSkillsDetailedSchema = z.object({
  required_skills: z
    .array(z.string().describe("Skill"))
    .describe("An array of skills that are required for the job"),
  desirable_skills: z
    .array(z.string().describe("Skill"))
    .describe("An array of skills that are desirable for the job"),
  job_title: z.string().describe("The job title"),
});

type Course = {
  title: string;
  url: string;
  price: string;
  image: string;
  headline: string;
};

export type RecommendationsData = z.infer<typeof skillsRecommendationSchema>;
export type Recommendation = z.infer<typeof skillRecommendationSchema>;
export type RecommendationWithCourse = Recommendation & {
  course: Course;
  active: boolean;
  id: string;
};
