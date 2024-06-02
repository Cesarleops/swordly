import express from "express";
import cors from "cors";
import { dbInit, db } from "./src/db.js";
import usersRouter from "./src/users/routes.js";
import linksRouter from "./src/links/routes.js";
import { groupsRouter } from "./src/groups/routes.js";
import { authRouter } from "./src/auth/routes.js";
import { envConfig } from "./src/config/index.js";

export const app = express();
const corsOptions = {
  origin: [
    /^http:\/\/localhost:3000(\/.*)?$/,
    "https://swordly-front.vercel.app",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", usersRouter);
app.use("/api", linksRouter);
app.use("/api", groupsRouter);

const client = await db.connect();
const PORT = envConfig.PORT;
app.listen(PORT, async () => {
  console.log(PORT);
  await dbInit();
  console.log("Hey! Server just started");
});
