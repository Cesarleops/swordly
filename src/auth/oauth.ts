import { GitHub, Google } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT as string,
  process.env.GITHUB_SECRET as string,
);

export const google = new Google(
  process.env.GOOGLE_CLIENT as string,
  process.env.GOOGLE_SECRET as string,
  "http://localhost:3031/api/login/google/callback",
);
