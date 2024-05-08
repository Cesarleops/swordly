import { Router } from "express";

import { validateRoutes } from "../middlewares/validate-routes.js";
import {
  getLink,
  getAllLinks,
  createLink,
  editLink,
  deleteLink,
  sortLinks,
} from "./controllers.js";

const linksRouter = Router();

linksRouter.get("/links", validateRoutes, getAllLinks);
linksRouter.get("/links/order", validateRoutes, sortLinks);
linksRouter.get("/links", validateRoutes, getAllLinks);
linksRouter.get("/links/:id", getLink);

linksRouter.post("/links", validateRoutes, createLink);
linksRouter.put("/links", editLink);
linksRouter.delete("/links", deleteLink);

export default linksRouter;
