import express from "express";
import { router } from "./src/router.js";

export const app = express();
const PORT = 3031;

app.use(express.json());
app.use("/api", router);

app.listen(PORT, () => {
  console.log("Hey! Server just started");
});
