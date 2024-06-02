import { production } from "./production.js";
import { development } from "./development.js";

const nodeEnv = process.env.NODE_ENV || "development";
export const envConfig = nodeEnv === "development" ? development : production;
