import { Router } from "express";

import { validateRoutes } from "../middlewares/validate-routes.js";
import {
  getLink,
  getAllLinks,
  createLink,
  editLink,
  deleteLink,
} from "./controllers.js";

const linksRouter = Router();

linksRouter.get("/links/:id", getLink);
linksRouter.get("/links", validateRoutes, getAllLinks);
linksRouter.post("/links", validateRoutes, createLink);
linksRouter.put("/links", editLink);
linksRouter.delete("/links", deleteLink);

export default linksRouter;
