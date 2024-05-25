import { hash, verify } from "@node-rs/argon2";
import { Request, Response } from "express";
import { generateIdFromEntropySize } from "lucia";
import { login, register } from "./queries.js";
import { lucia } from "./index.js";
import { generateState, generateCodeVerifier } from "arctic";
import { github, google } from "./oauth.js";
import { parseCookies } from "oslo/cookie";
import { db } from "../db.js";

export const signUp = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
    });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({
      success: false,
    });
  }

  const hashedPassword = await hash(password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  const userId = generateIdFromEntropySize(10);

  try {
    await register(userId, email, hashedPassword);
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res
      .status(302)
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .setHeader("Location", "http://localhost:3000/dashboard")
      .end();
  } catch (error) {
    console.log("error al registrarse", error);
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || typeof email !== "string") {
    return res.status(400).json({
      success: false,
    });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
    });
  }

  const user = await login(email);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid user or email",
    });
  }
  const validPassword = await verify(user.password_hash, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });
  if (!validPassword) {
    return res.status(400).json({
      success: false,
      message: "Invalid user or email",
    });
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  res
    .status(302)
    .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
    .setHeader("Location", "http://localhost:3000/dashboard")
    .end();
};

export const githubLogin = async (req: Request, res: Response) => {
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
};

export const githubLoginCallback = async (req: Request, res: Response) => {
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

    console.log("github result", githubUserResult);
    const existingUser = await db.query(
      "SELECT * FROM users WHERE github_id = $1",
      [githubUserResult.id],
    );

    if (existingUser.rows.length > 0) {
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
    const newUser = await db.query(
      "INSERT INTO users(id,username,github_id) VALUES($1, $2, $3) RETURNING *",
      [userId, githubUserResult.login, githubUserResult.id],
    );
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res
      .status(302)
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .setHeader("Location", "http://localhost:3000/dashboard")
      .end();
  } catch (error) {
    console.log("error creando", error);
  }
};

export const googleLogin = async (req: Request, res: Response) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ["email", "profile"],
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
};

export const googleLoginCallback = async (req: Request, res: Response) => {
  try {
    const cookies = parseCookies(req.headers.cookie ?? "");
    const code = req.query.code;
    const state = req.query.state;

    const codeVerifier = cookies.get("google_oauth_verifier");
    console.log("codigo", code);
    console.log("verificador", codeVerifier);
    console.log("state", state);
    if (!code || !codeVerifier) {
      res.status(404).send("Something went Wrong");
    }

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

    const existingUser = await db.query(
      "SELECT * FROM users WHERE google_id = $1",
      [user.sub],
    );
    if (existingUser.rows.length > 0) {
      console.log("si existe");
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
    const newUser = await db.query(
      "INSERT INTO users(id,username, google_id) VALUES($1, $2, $3) RETURNING *",
      [userId, user.name, user?.sub],
    );
    console.log("new go", newUser);
    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res
      .status(302)
      .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
      .setHeader("Location", "http://localhost:3000/dashboard")
      .end();
  } catch (error) {
    console.log("error creando google", error);
    res.redirect("http://localhost:3000/login");
  }
};

interface GitHubUserResult {
  id: number;
  login: string;
}
