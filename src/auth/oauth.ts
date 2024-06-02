import { GitHub, Google } from "arctic";
import { envConfig } from "../config/index.js";

export const github = new GitHub(
  process.env.GITHUB_CLIENT as string,
  process.env.GITHUB_SECRET as string,
);

export const google = new Google(
  process.env.GOOGLE_CLIENT as string,
  process.env.GOOGLE_SECRET as string,
  `${envConfig.serverUrl}/api/login/google/callback`,
);
