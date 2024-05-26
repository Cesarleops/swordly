import { Router } from "express";

import { parseCookies } from "oslo/cookie";
import { lucia } from "../auth/index.js";
import { createUser } from "./controllers.js";
import { validateRoutes } from "../middlewares/validate-routes.js";
import { db } from "../db.js";

const usersRouter = Router();

usersRouter.post("/user", createUser);
usersRouter.get("/user", async (req, res) => {
  const sessionId = parseCookies(req.headers.cookie ?? "").get("auth_session");
  console.log("sess", parseCookies(req.headers.cookie ?? ""));
  console.log("session", sessionId);
  if (sessionId) {
    const { user } = await lucia.validateSession(sessionId);
    console.log("user ", user);
    if (user) {
      if (user.google_id !== null) {
        return res.json({
          username: user.username,
          links_amount: user.links_amount,
          id: user.id,
        });
      }
      if (user.github_id !== null) {
        return res.json({
          username: user.username,
          links_amount: user.links_amount,
          id: user.id,
        });
      }
      const customUsername = user.email.slice(0, user.email.indexOf("@"));
      console.log(customUsername);
      return res.json({
        username: customUsername,
        links_amount: user.links_amount,
        id: user.id,
      });
    }
  } else {
    res.status(404).json({
      user: "Invalid User",
    });
  }
});

usersRouter.get("/user/delete/:id", async (req, res) => {
  const { id } = req.params;
  console.log("viene aca con este id", id);
  try {
    await db.query(
      `
          DELETE FROM users WHERE id = $1
    `,
      [id],
    );
    res.status(302).setHeader("Location", "http://localhost:3000/login").end();
  } catch (error) {
    console.log("error borrando al usuario", error);
  }
});
export default usersRouter;
