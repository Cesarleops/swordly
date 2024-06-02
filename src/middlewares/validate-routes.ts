import { Response, Request, NextFunction } from "express";
import { parseCookies } from "oslo/cookie";
import { lucia } from "../auth/index.js";
import { CustomRequest } from "../links/controllers.js";
import { envConfig } from "../config/index.js";
export const validateRoutes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookies = parseCookies(req.headers.cookie ?? "");
  const sessionId = cookies.get("auth_session");
  if (sessionId) {
    try {
      const { user, session } = await lucia.validateSession(sessionId);
      if (session && user) {
        (req as CustomRequest).user = user;
        next();
      } else {
        await lucia.invalidateSession(sessionId);
        const sessionCookie = lucia.createBlankSessionCookie();
        res
          .cookie(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes,
          )
          .redirect(`${envConfig.clientUrl}/login`);
      }
    } catch (error) {
      throw Error("Something went wrong");
    }
  }
};
