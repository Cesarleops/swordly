import { Router } from "express";
import {
  createLink,
  deleteLink,
  editLink,
  getAllLinks,
  getSingleLink,
} from "./links/controllers.js";
import { createUser } from "./users/controllers.js";
import { generateCodeVerifier, generateState, Google } from "arctic";
import { GitHub } from "arctic";

export const github = new GitHub(
  process.env.GITHUB_CLIENT as string,
  process.env.GITHUB_SECRET as string,
);

export const google = new Google(
  process.env.GOOGLE_CLIENT as string,
  process.env.GOOGLE_SECRET as string,
  "http://localhost:3031/api/login/google/callback",
);
export const router = Router();

//Links

router.get("/links/:id", getSingleLink);
router.get("/links", getAllLinks);
router.post("/links", createLink);
router.put("/links", editLink);
router.delete("/links", deleteLink);

//Users

router.post("/user", createUser);

//Auth

router.get("/login/google", async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier);
  res.status(302).setHeader("Location", url.toString()).end();
});

router.get("/login/github", async (req, res) => {
  const state = generateState();
  const url = await github.createAuthorizationURL(state);
  res.status(302).setHeader("Location", url.toString()).end();
});

router.get("/login/github/callback", async (request: Request) => {
  //HANDLE USER SESSION
});
