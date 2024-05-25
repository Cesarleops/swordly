import { Router } from "express";

import { parseCookies } from "oslo/cookie";
import { lucia } from "./index.js";
import {
  githubLogin,
  githubLoginCallback,
  googleLogin,
  googleLoginCallback,
  signIn,
  signUp,
} from "./controllers.js";

export const authRouter = Router();

authRouter.post("/signup", signUp);

authRouter.post("/login", signIn);

authRouter.get("/login/google", googleLogin);

authRouter.get("/login/google/callback", googleLoginCallback);

authRouter.get("/login/github", githubLogin);

authRouter.get("/login/github/callback", githubLoginCallback);

authRouter.get("/logout", async (req, res) => {
  const cookies = parseCookies(req.headers.cookie ?? "");
  const sessionId = cookies.get("auth_session");
  if (sessionId) {
    await lucia.invalidateSession(sessionId);
    const sessionCookie = lucia.createBlankSessionCookie();
    res
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .redirect("http://localhost:3000/login");
  }
});
