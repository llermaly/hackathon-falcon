import {
  ChatPromptTemplate,
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
} from "@langchain/core/prompts";

export const extractSkillsPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a skilled assistant that can accurately extract a list of skills from a given text.
  Your task is to read the provided text, identify the user's skills, and present them in a clear, concise list format.
  The extracted skills should be directly relevant to the user's experience and expertise as described in the text.
  Given the context, your task is to extract a list of skills from the user's provided text.
  {formatInstructions}
  `,
    ),
    HumanMessagePromptTemplate.fromTemplate(`User's Text:
  ---------------------
  {text}
  ---------------------
  Extracted Skills:`),
  ],
  inputVariables: ["text", "formatInstructions"],
});

export const extractJobDetailsPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a proficient assistant with the ability to analyze job descriptions and accurately extract key information.
  Your task is to read the provided job description text, identify the job title, required skills, and desirable skills, and present them in a clear, concise format.
  The extracted information should be directly relevant to the job description provided.
  {formatInstructions}
  `,
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
  inputVariables: ["text", "formatInstructions"],
});

export const skillRecommendationPrompt = new ChatPromptTemplate({
  promptMessages: [
    SystemMessagePromptTemplate.fromTemplate(
      `You are a helpful assistant that can generate skill recommendations based on a person's current skills and future goals.
  Each skill recommendation should be clear and specific, mentioning what skills are needed for the person to achieve their goals.
  Use bullet points to list the recommended skills, indicate if they are required or desirable, and provide a brief description of why each skill is important for the goal.
  Additionally, indicate the order in which the recommended skills should be learned to maximize the efficiency and effectiveness of learning, and justify why it is important to learn them in that order.
  Given the context, your task is to generate a list of recommended skills based on the user's current skills and future goals.
  Remember to use bullet points, specify if the skill is required or desirable, and provide brief descriptions for each skill, as well as the learning order.
  {formatInstructions}
  `,
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
  inputVariables: ["currentSkills", "futureGoals", "formatInstructions"],
});
