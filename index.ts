import express from "express";
import cors from "cors";
import { authRouter } from "./src/router.js";
import { dbInit, pool } from "./src/db.js";
import usersRouter from "./src/users/routes.js";
import linksRouter from "./src/links/routes.js";

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

const client = await pool.connect();

app.listen(PORT, async () => {
  await dbInit();
  console.log("Hey! Server just started");
});
