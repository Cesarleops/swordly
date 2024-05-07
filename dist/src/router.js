import { Router } from "express";
import { createLink, deleteLink, editLink, getAllLinks, getSingleLink, } from "./links/controllers.js";
import { createUser } from "./users/controllers.js";
import { parseCookies } from "oslo/cookie";
import { generateCodeVerifier, generateState } from "arctic";
import { google, github } from "./auth/oauth.js";
import { lucia } from "./auth/index.js";
import { pool } from "./db.js";
import { generateIdFromEntropySize } from "lucia";
import { validateRoutes } from "./middlewares/validate-routes.js";
export const router = Router();
//Links
router.get("/links/:id", getSingleLink);
router.get("/links", validateRoutes, getAllLinks);
router.post("/links", validateRoutes, createLink);
router.put("/links", editLink);
router.delete("/links", deleteLink);
//Users
router.post("/user", createUser);
router.get("/user", async (req, res) => {
    console.log("hey", req.headers.cookie);
    const sessionId = parseCookies(req.headers.cookie ?? "").get("auth_session");
    console.log("fh", sessionId);
    if (sessionId) {
        const { session, user } = await lucia.validateSession(sessionId);
        console.log(user);
        console.log(session);
        if (user) {
            res.json(user);
        }
    }
});
//Auth
router.get("/login/google", async (req, res) => {
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
router.get("/login/google/callback", async (req, res) => {
    try {
        const cookies = parseCookies(req.headers.cookie ?? "");
        const code = req.query.code;
        const codeVerifier = cookies.get("google_oauth_verifier");
        const tokens = await google.validateAuthorizationCode(code, codeVerifier);
        const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const user = await response.json();
        console.log("Google user", user);
    }
    catch (error) {
        res.redirect("http://localhost:3000/login");
    }
});
router.get("/login/github", async (req, res) => {
    console.log("LUCIA", lucia);
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
router.get("/login/github/callback", async (req, res) => {
    const cookies = parseCookies(req.headers.cookie ?? "");
    const cookieState = cookies.get("github_oauth_state");
    const state = req.query.state;
    const code = req.query.code;
    if (!state || !cookieState || !code || cookieState !== state) {
        res.status(404).send("Something went Wrong");
    }
    try {
        const tokens = await github.validateAuthorizationCode(code);
        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`,
            },
        });
        const githubUserResult = await githubUserResponse.json();
        const existingUser = await pool.query("SELECT * FROM users WHERE github_id = $1", [githubUserResult.id]);
        if (existingUser.rows.length > 0) {
            console.log(existingUser.rows[0]);
            const session = await lucia.createSession(existingUser.rows[0].id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            return res
                .status(302)
                .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
                .setHeader("Location", "http://localhost:3000/dashboard")
                .end();
        }
        const userId = generateIdFromEntropySize(10);
        await pool.query("INSERT INTO users(id,username,github_id) VALUES($1, $2, $3) RETURNING *", [userId, githubUserResult.login, githubUserResult.id]);
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        res
            .status(302)
            .cookie(sessionCookie.name, sessionCookie.value, sessionCookie.attributes)
            .setHeader("Location", "http://localhost:3000/dashboard")
            .end();
    }
    catch (error) { }
});
router.get("/logout", async (req, res) => {
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
