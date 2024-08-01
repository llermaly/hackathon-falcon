import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { randomUUID } from "crypto";
import { StructuredOutputParser } from "langchain/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import {
  extractSkillsDetailedSchema,
  extractSkillsSchema,
  Recommendation,
  RecommendationsData,
  RecommendationWithCourse,
  skillsRecommendationSchema,
} from "@/server/utils/schemas";
import {
  extractJobDetailsPrompt,
  extractSkillsPrompt,
  skillRecommendationPrompt,
} from "@/server/utils/prompts";
import { llm } from "@/server/utils/llm";
import { fetchUdemyCourses } from "@/server/utils/udemy";

const addCoursesToSkills = async (data: Recommendation[]) => {
  const result = await Promise.all(
    data.map(async (r) => {
      const udemyResponse = await fetchUdemyCourses({
        search: r.skill,
        size: 1,
      });

      const skillCourses = udemyResponse?.results?.map((r: any) => ({
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

export const destinyRouter = createTRPCRouter({
  getSkillRecommendations: publicProcedure
    .input(
      z.object({
        currentSkills: z.string(),
        futureGoals: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const parser = StructuredOutputParser.fromZodSchema(
        skillsRecommendationSchema,
      );

      const chain = RunnableSequence.from([
        skillRecommendationPrompt,
        llm,
        parser,
      ]);

      const data = await chain.invoke({
        currentSkills: input.currentSkills,
        futureGoals: input.futureGoals,
        formatInstructions: parser.getFormatInstructions(),
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
        id: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const udemyResponse = await fetchUdemyCourses({
        search: input.skill,
        size: 5,
      });

      const skillCourses = udemyResponse.data.results.map((r: any) => ({
        title: r.title,
        url: `https://udemy.com${r.url}`,
        price: r.price,
        image: r.image_480x270,
        headline: r.headline,
      }));

      const data: RecommendationWithCourse[] = skillCourses.map((r: any) => ({
        skill: r.title,
        description: r.headline,
        order: 0,
        order_justification: "",
        course: r,
        active: false,
        id: input.id,
      }));

      return data as RecommendationWithCourse[];
    }),
  extractSkills: publicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const parser = StructuredOutputParser.fromZodSchema(extractSkillsSchema);

      const chain = RunnableSequence.from([extractSkillsPrompt, llm, parser]);

      const data = await chain.invoke({
        text: input.text,
        formatInstructions: parser.getFormatInstructions(),
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
      const parser = StructuredOutputParser.fromZodSchema(
        extractSkillsDetailedSchema,
      );

      const chain = RunnableSequence.from([
        extractJobDetailsPrompt,
        llm,
        parser,
      ]);

      const data = await chain.invoke({
        text: input.text,
        formatInstructions: parser.getFormatInstructions(),
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
