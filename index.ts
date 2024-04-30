import express from "express";
import { router } from "./src/router";

const app = express();
const PORT = 3000;

app.use("/api", router);

app.listen(PORT, () => {
  console.log("Hey! Server just started");
});
