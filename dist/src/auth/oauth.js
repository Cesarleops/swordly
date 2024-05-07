import { GitHub, Google } from "arctic";
export const github = new GitHub(process.env.GITHUB_CLIENT, process.env.GITHUB_SECRET);
export const google = new Google(process.env.GOOGLE_CLIENT, process.env.GOOGLE_SECRET, "http://localhost:3031/api/login/google/callback");
