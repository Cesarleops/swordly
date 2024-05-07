import express from "express";
import cors from "cors";
import { router } from "./src/router.js";
import { dbInit, pool } from "./src/db.js";
export const app = express();
const PORT = 3031;
const corsOptions = {
    origin: /^http:\/\/localhost:3000(\/.*)?$/,
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", router);
const client = await pool.connect();
app.listen(PORT, async () => {
    await dbInit();
    console.log("Hey! Server just started");
});
