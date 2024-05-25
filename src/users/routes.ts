import { Router } from "express";

import { parseCookies } from "oslo/cookie";
import { lucia } from "../auth/index.js";
import { createUser } from "./controllers.js";
import { validateRoutes } from "../middlewares/validate-routes.js";

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
        });
      }
      if (user.github_id !== null) {
        return res.json({
          username: user.username,
          links_amount: user.links_amount,
        });
      }
      const customUsername = user.email.slice(0, user.email.indexOf("@"));
      console.log(customUsername);
      return res.json({
        username: customUsername,
        links_amount: user.links_amount,
      });
    }
  } else {
    res.status(404).json({
      user: "Invalid User",
    });
  }
});

export default usersRouter;
