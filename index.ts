import express from "express";
import cors from "cors";
import { dbInit, db } from "./src/db.js";
import usersRouter from "./src/users/routes.js";
import linksRouter from "./src/links/routes.js";
import { groupsRouter } from "./src/groups/routes.js";
import { authRouter } from "./src/auth/routes.js";

export const app = express();
const PORT = 3031;
const corsOptions = {
  origin: /^http:\/\/localhost:3000(\/.*)?$/,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", usersRouter);
app.use("/api", linksRouter);
app.use("/api", groupsRouter);

const client = await db.connect();

app.listen(PORT, async () => {
  await dbInit();
  console.log("Hey! Server just started");
});
