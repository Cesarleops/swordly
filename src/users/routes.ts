import { Router } from "express";

import { parseCookies } from "oslo/cookie";
import { lucia } from "../auth/index.js";
import { createUser } from "./controllers.js";
import { validateRoutes } from "../middlewares/validate-routes.js";

const usersRouter = Router();

usersRouter.post("/user", createUser);
usersRouter.get("/user", async (req, res) => {
  const sessionId = parseCookies(req.headers.cookie ?? "").get("auth_session");
  if (sessionId) {
    const { user } = await lucia.validateSession(sessionId);
    console.log("entra");
    if (user) {
      res.json({
        username: user.username,
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
