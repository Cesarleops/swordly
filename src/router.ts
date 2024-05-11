import { Router, Request, Response } from "express";

import { parseCookies } from "oslo/cookie";
import { generateCodeVerifier, generateState } from "arctic";
import { google, github } from "./auth/oauth.js";
import { lucia } from "./auth/index.js";
import { pool } from "./db.js";
import { generateIdFromEntropySize } from "lucia";
import { validateRoutes } from "./middlewares/validate-routes.js";

export const authRouter = Router();

authRouter.get("/login/google", async (req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["email"],
  });
  res
    .cookie("google_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1
    })
    .cookie("google_oauth_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1
    })
    .status(302)
    .setHeader("Location", url.toString())
    .end();
});

authRouter.get("/login/google/callback", async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie ?? "");
    const code = req.query.code;
    const codeVerifier = cookies.get("google_oauth_verifier");

    const tokens = await google.validateAuthorizationCode(
      code as string,
      codeVerifier as string,
    );

    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      },
    );
    const user = await response.json();
    console.log("Google user", user);
  } catch (error) {
    res.redirect("http://localhost:3000/login");
  }
});

authRouter.get("/login/github", async (req, res) => {
  // console.log("LUCIA", lucia);

  const state = generateState();
  const url = await github.createAuthorizationURL(state);
  res
    .cookie("github_oauth_state", state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1000, // 1
    })
    .status(302)
    .setHeader("Location", url.toString())
    .end();
});
authRouter.get(
  "/login/github/callback",
  async (req: Request, res: Response) => {
    const cookies = parseCookies(req.headers.cookie ?? "");

    const cookieState = cookies.get("github_oauth_state");
    const state = req.query.state;
    const code = req.query.code;

    if (!state || !cookieState || !code || cookieState !== state) {
      res.status(404).send("Something went Wrong");
    }
    try {
      const tokens = await github.validateAuthorizationCode(code as string);

      const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
        },
      });
      const githubUserResult: GitHubUserResult =
        (await githubUserResponse.json()) as GitHubUserResult;

      const existingUser = await pool.query(
        "SELECT * FROM users WHERE github_id = $1",
        [githubUserResult.id],
      );

      if (existingUser.rows.length > 0) {
        console.log(existingUser.rows[0]);
        const session = await lucia.createSession(existingUser.rows[0].id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        return res
          .status(302)
          .cookie(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
          )
          .setHeader("Location", "http://localhost:3000/dashboard")
          .end();
      }

      const userId = generateIdFromEntropySize(10);
      await pool.query(
        "INSERT INTO users(id,username,github_id) VALUES($1, $2, $3) RETURNING *",
        [userId, githubUserResult.username, githubUserResult.id],
      );
      const session = await lucia.createSession(userId, {});
      const sessionCookie = lucia.createSessionCookie(session.id);

      res
        .status(302)
        .cookie(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        )
        .setHeader("Location", "http://localhost:3000/dashboard")
        .end();
    } catch (error) {}
  },
);

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

interface GitHubUserResult {
  id: number;
  username: string;
}
