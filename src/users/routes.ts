// import { parseCookies } from "oslo/cookie";
// import { lucia } from "../auth/index.js";
// import router from "../router.js";
// import { createUser } from "./controllers.js";

// router.post("/user", createUser);
// router.get("/user", async (req, res) => {
//   console.log("hey", req.headers.cookie);
//   const sessionId = parseCookies(req.headers.cookie ?? "").get("auth_session");
//   console.log("fh", sessionId);
//   if (sessionId) {
//     const { session, user } = await lucia.validateSession(sessionId);
//     console.log(user);
//     console.log(session);
//     if (user) {
//       res.json(user);
//     }
//   }
// });
