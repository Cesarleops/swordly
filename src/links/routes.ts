import { Router } from "express";

import { validateRoutes } from "../middlewares/validate-routes.js";
import {
  getLink,
  getAllLinks,
  createLink,
  editLink,
  deleteLink,
  sortLinks,
  searchLinkByText,
} from "./controllers.js";

const linksRouter = Router();

linksRouter.get("/links/order", validateRoutes, sortLinks);
linksRouter.get("/links/search", validateRoutes, searchLinkByText);

linksRouter.get("/links", validateRoutes, getAllLinks);
linksRouter.get("/links/:id", validateRoutes, getLink);

linksRouter.post("/links", validateRoutes, createLink);
linksRouter.put("/links", validateRoutes, editLink);
linksRouter.delete("/links", validateRoutes, deleteLink);

export default linksRouter;
