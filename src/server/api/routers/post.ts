import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { zodToJsonSchema } from "zod-to-json-schema";

import { ChatOpenAI } from "@langchain/openai";
import { JsonOutputFunctionsParser } from "langchain/output_parsers";
import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";
import axios from "axios";
import { randomUUID } from "crypto";

const skillRecommendationSchema = z.object({
  skill: z.string().describe("The recommended skill"),
  description: z.string().describe("The description of the skill"),
  order: z.number().describe("The order of the skill"),
  order_justification: z.string().describe("The justification for the order"),
});

const skillsRecommendationSchema = z.object({
  required_skills: z
    .array(skillRecommendationSchema)
    .describe("An array of the recommended skills"),
  desirable_skills: z
    .array(skillRecommendationSchema)
    .describe("An array of the desirable skills"),
});

const skillRecommendationPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful assistant that can generate skill recommendations based on a person's current skills and future goals.
Each skill recommendation should be clear and specific, mentioning what skills are needed for the person to achieve their goals.
Use bullet points to list the recommended skills, indicate if they are required or desirable, and provide a brief description of why each skill is important for the goal.
Additionally, indicate the order in which the recommended skills should be learned to maximize the efficiency and effectiveness of learning, and justify why it is important to learn them in that order.
Given the context, your task is to generate a list of recommended skills based on the user's current skills and future goals.
Remember to use bullet points, specify if the skill is required or desirable, and provide brief descriptions for each skill, as well as the learning order.`,
    ),
    HumanMessagePromptTemplate.fromTemplate(`My Current Skills:
---------------------
{currentSkills}
---------------------
My Future Goals:
---------------------
{futureGoals}
---------------------
Recommended Skills with their description, learning order, and whether they are required or desirable:`),
  ],
  inputVariables: ["currentSkills", "futureGoals"],
});

const extractSkillsSchema = z.object({
  skills: z.array(z.string().describe("Skill")).describe("An array of skills"),
});

const extractSkillsDetailedSchema = z.object({
  required_skills: z
    .array(z.string().describe("Skill"))
    .describe("An array of skills that are required for the job"),
  desirable_skills: z
    .array(z.string().describe("Skill"))
    .describe("An array of skills that are desirable for the job"),
  job_title: z.string().describe("The job title"),
});

const extractSkillsPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a skilled assistant that can accurately extract a list of skills from a given text.
Your task is to read the provided text, identify the user's skills, and present them in a clear, concise list format.
The extracted skills should be directly relevant to the user's experience and expertise as described in the text.
Given the context, your task is to extract a list of skills from the user's provided text.`,
    ),
    HumanMessagePromptTemplate.fromTemplate(`User's Text:
---------------------
{text}
---------------------
Extracted Skills:`),
  ],
  inputVariables: ["text"],
});

const extractJobDetailsPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a proficient assistant with the ability to analyze job descriptions and accurately extract key information.
Your task is to read the provided job description text, identify the job title, required skills, and desirable skills, and present them in a clear, concise format.
The extracted information should be directly relevant to the job description provided.`,
    ),
    HumanMessagePromptTemplate.fromTemplate(`Job Description:
---------------------
{text}
---------------------
Extracted Information:
Job Title: 
Required Skills: 
Desirable Skills:`),
  ],
  inputVariables: ["text"],
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

const udemyClientId = process.env.UDEMY_CLIENT_ID;
const udemyClientSecret = process.env.UDEMY_CLIENT_SECRET;
const credentials = `${udemyClientId}:${udemyClientSecret}`;
const buff = Buffer.from(credentials);
const udemyAuth = buff.toString("base64");

const addCoursesToSkills = async (data: Recommendation[]) => {
  const result = await Promise.all(
    data.map(async (r) => {
      const udemyResponse = await axios.get(
        "https://www.udemy.com/api-2.0/courses/",
        {
          headers: {
            Authorization: `Basic ${udemyAuth}`,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          params: {
            search: r.skill,
            page_size: 1,
          },
        },
      );

      const skillCourses = udemyResponse.data.results.map((r: any) => ({
        title: r.title,
        url: `https://udemy.com${r.url}`,
        price: r.price,
        image: r.image_480x270,
        headline: r.headline,
      }));

      return {
        ...r,
        course: skillCourses[0],
        active: false,
        id: randomUUID(),
      };
    }),
  );

  return result.sort((a, b) => a.order - b.order);
};

export const postRouter = createTRPCRouter({
  getSkillRecommendations: publicProcedure
    .input(
      z.object({
        currentSkills: z.string(),
        futureGoals: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.2,
      });

      const functionCallingModel = llm.bind({
        functions: [
          {
            name: "output_formatter",
            description: "Should always be used to properly format output",
            parameters: zodToJsonSchema(skillsRecommendationSchema),
          },
        ],
        function_call: { name: "output_formatter" },
      });

      const outputParser = new JsonOutputFunctionsParser();

      const chain = skillRecommendationPrompt
        .pipe(functionCallingModel)
        .pipe(outputParser);

      const data = await chain.invoke({
        currentSkills: input.currentSkills,
        futureGoals: input.futureGoals,
      });

      const requiredSkillsWithCourses = await addCoursesToSkills(
        (data as RecommendationsData).required_skills,
      );

      const desirableSkillsWithCourses = await addCoursesToSkills(
        (data as RecommendationsData).desirable_skills,
      );

      return {
        requiredSkills: requiredSkillsWithCourses,
        desirableSkills: desirableSkillsWithCourses,
      };
    }),

  getCourseBySkill: publicProcedure
    .input(
      z.object({
        skill: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const udemyResponse = await axios.get(
        "https://www.udemy.com/api-2.0/courses/",
        {
          headers: {
            Authorization: `Basic ${udemyAuth}`,
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          params: {
            search: input.skill,
            page_size: 5,
          },
        },
      );

      const skillCourses = udemyResponse.data.results.map((r: any) => ({
        title: r.title,
        url: `https://udemy.com${r.url}`,
        price: r.price,
        image: r.image_480x270,
        headline: r.headline,
      }));

      return skillCourses as Course[];
    }),
  extractSkills: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.2,
      });

      const functionCallingModel = llm.bind({
        functions: [
          {
            name: "output_formatter",
            description: "Should always be used to properly format output",
            parameters: zodToJsonSchema(extractSkillsSchema),
          },
        ],
        function_call: { name: "output_formatter" },
      });

      const outputParser = new JsonOutputFunctionsParser();

      const chain = extractSkillsPrompt
        .pipe(functionCallingModel)
        .pipe(outputParser);

      const data = await chain.invoke({
        text: input.text,
      });

      return data as z.infer<typeof extractSkillsSchema>;
    }),
  extractSkillsDetailed: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const llm = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0.2,
      });

      const functionCallingModel = llm.bind({
        functions: [
          {
            name: "output_formatter",
            description: "Should always be used to properly format output",
            parameters: zodToJsonSchema(extractSkillsDetailedSchema),
          },
        ],
        function_call: { name: "output_formatter" },
      });

      const outputParser = new JsonOutputFunctionsParser();

      const chain = extractJobDetailsPrompt
        .pipe(functionCallingModel)
        .pipe(outputParser);

      const data = await chain.invoke({
        text: input.text,
      });

      return data as z.infer<typeof extractSkillsDetailedSchema>;
    }),
  saveLearningPath: publicProcedure
    .input(
      z.object({
        currentSkills: z.array(z.string()),
        newJobTitle: z.string(),
        newJobRequiredSkills: z.array(z.string()),
        newJobDesirableSkills: z.array(z.string()),
        learningPath: z.string(),
        id: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (input.id) {
        const result = await ctx.db.learningPath.update({
          where: {
            id: input.id,
          },
          data: {
            currentSkills: input.currentSkills,
            newJobTitle: input.newJobTitle,
            newJobRequiredSkills: input.newJobRequiredSkills,
            newJobDesirableSkills: input.newJobDesirableSkills,
            learningPath: input.learningPath,
          },
        });

        return result;
      }

      const result = await ctx.db.learningPath.create({
        data: {
          currentSkills: input.currentSkills,
          newJobTitle: input.newJobTitle,
          newJobRequiredSkills: input.newJobRequiredSkills,
          newJobDesirableSkills: input.newJobDesirableSkills,
          learningPath: input.learningPath,
        },
      });

      return result;
    }),
  getLearningPath: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const result = await ctx.db.learningPath.findUnique({
        where: {
          id: input,
        },
      });

      if (!result) {
        return null;
      }

      return {
        ...result,
        learningPath: JSON.parse(result.learningPath),
      } as {
        id: string;
        currentSkills: string[];
        newJobTitle: string;
        newJobRequiredSkills: string[];
        newJobDesirableSkills: string[];
        learningPath: {
          requiredData: RecommendationWithCourse[];
          desirableData: RecommendationWithCourse[];
        };
      };
    }),
});
