import { Router } from "express";
import {
  createLink,
  deleteLink,
  editLink,
  getAllLinks,
  getSingleLink,
} from "./links/controllers";
import { createUser } from "./users/controllers";

export const router = Router();

//Links

router.get("/links/:id", getSingleLink);
router.get("/links", getAllLinks);
router.post("/links", createLink);
router.put("/links", editLink);
router.delete("/links", deleteLink);

//Users

router.post("/user", createUser);
