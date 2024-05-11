import { Router } from "express";
import { createGroup, getSingleGroup, getUserGroups } from "./controllers.js";
import { validateRoutes } from "../middlewares/validate-routes.js";

export const groupsRouter = Router();

groupsRouter.post("/groups", validateRoutes, createGroup);
groupsRouter.get("/groups", validateRoutes, getUserGroups);
groupsRouter.get("/groups/:id", validateRoutes, getSingleGroup);
