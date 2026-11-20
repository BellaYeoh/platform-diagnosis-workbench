import "dotenv/config";
import { ChatOpenAI } from "@langchain/openai";

const apiKey = process.env.MODEL_API_KEY;
const modelName = process.env.MODEL_NAME;

if (!apiKey || !modelName) {
  throw new Error("请配置 MODEL_API_KEY 和 MODEL_NAME");
}

export const model = new ChatOpenAI({
  apiKey,
  model: modelName,
  maxRetries: 0,
  timeout: 30_000,
  ...(process.env.MODEL_BASE_URL
    ? {
        configuration: {
          baseURL: process.env.MODEL_BASE_URL,
        },
      }
    : {}),
});
