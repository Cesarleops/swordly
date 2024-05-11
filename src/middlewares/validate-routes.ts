import { Response, Request, NextFunction } from "express";
import { parseCookies } from "oslo/cookie";
import { lucia } from "../auth/index.js";
import { CustomRequest } from "../links/controllers.js";
export const validateRoutes = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookies = parseCookies(req.headers.cookie ?? "");
  const sessionId = cookies.get("auth_session");
  console.log("ss", sessionId);
  if (sessionId) {
    try {
      const { user, session } = await lucia.validateSession(sessionId);
      if (session && user) {
        (req as CustomRequest).user = user;
        console.log("llegue");
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
          .redirect("http://localhost:3000/login");
      }
    } catch (error) {
      throw Error("NONO");
    }
  } else {
    throw Error("Invalide Credentials");
  }
};
