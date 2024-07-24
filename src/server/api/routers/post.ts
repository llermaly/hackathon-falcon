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

const skillRecommendationSchema = z.object({
  skill: z.string().describe("The recommended skill"),
  description: z.string().describe("The description of the skill"),
  order: z.number().describe("The order of the skill"),
  order_justification: z.string().describe("The justification for the order"),
});

const skillsRecommendationSchema = z.object({
  recommendations: z
    .array(skillRecommendationSchema)
    .describe("An array of recommended skills"),
});

const skillRecommendationPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful assistant that can generate skill recommendations based on a person's current skills and future goals.
Each skill recommendation should be clear and specific, mentioning what skills are needed for the person to achieve their goals.
Use bullet points to list the recommended skills and provide a brief description of why each skill is important for the goal.
Additionally, indicate the order in which the recommended skills should be learned to maximize the efficiency and effectiveness of learning, and justify why it is important to learn them in that order.
Given the context, your task is to generate a list of recommended skills based on the user's current skills and future goals.
Remember to use bullet points and provide brief descriptions for each skill, as well as the learning order.`,
    ),
    HumanMessagePromptTemplate.fromTemplate(`My Current Skills:
---------------------
{currentSkills}
---------------------
My Future Goals:
---------------------
{futureGoals}
---------------------
Recommended Skills with their description and learning order:`),
  ],
  inputVariables: ["currentSkills", "futureGoals"],
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

export const postRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

  getLatest: publicProcedure.query(({ ctx }) => {
    return ctx.db.post.findFirst({
      orderBy: { createdAt: "desc" },
    });
  }),

  getSkillRecommendations: publicProcedure
    .input(
      z.object({
        currentSkills: z.string(),
        futureGoals: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const udemyClientId = process.env.UDEMY_CLIENT_ID;
      const udemyClientSecret = process.env.UDEMY_CLIENT_SECRET;

      const credentials = `${udemyClientId}:${udemyClientSecret}`;

      const buff = Buffer.from(credentials);

      const base64data = buff.toString("base64");

      const llm = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
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

      const dataWithCourses = await Promise.all(
        (data as RecommendationsData).recommendations.map(async (r) => {
          const udemyResponse = await axios.get(
            "https://www.udemy.com/api-2.0/courses/",
            {
              headers: {
                Authorization: `Basic ${base64data}`,
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
          };
        }),
      );

      const sorted = dataWithCourses.sort((a, b) => a.order - b.order);

      return sorted as (Recommendation & { course: Course })[];
    }),
});
