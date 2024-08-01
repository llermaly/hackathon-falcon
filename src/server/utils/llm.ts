import { ChatOpenAI } from "@langchain/openai";

export const llm = new ChatOpenAI({
  model: "tiiuae/falcon-180B-chat",
  temperature: 0,
  apiKey: process.env.A71_API_KEY,
  configuration: {
    baseURL: "https://api.ai71.ai/v1",
  },
});
