import { Request, Response } from "express";
import {
  createGroupDB,
  deleteGroup,
  getGroupById,
  getGroups,
  updateGroup,
} from "./queries.js";
import { CustomRequest } from "../links/controllers.js";

export async function createGroup(req: Request, res: Response) {
  const { name, description, links } = req.body;
  console.log("links to insert", links);

  try {
    await createGroupDB(
      name,
      (req as CustomRequest).user.id,
      description,
      links,
    );
    res.end();
  } catch (error) {
    console.log(error);
  }
}

export async function getUserGroups(req: Request, res: Response) {
  try {
    const data = await getGroups((req as CustomRequest).user.id);
    console.log("grupos", data);
    res.json(data);
  } catch (error) {
    console.log(error);
  }
}

export async function getSingleGroup(req: Request, res: Response) {
  try {
    const group = await getGroupById(req.params.id);
    res.json(group);
  } catch (error) {
    console.log(error);
  }
}

export async function updateGroupHandler(req: Request, res: Response) {
  try {
    console.log("body del put", req.body);
    const { name, description, id } = req.body;
    const group = await updateGroup(id, name, description);
    res.json(group);
  } catch (error) {
    console.log(error);
  }
}

export async function deleteGroupHandler(req: Request, res: Response) {
  console.log("body del delete", req.body);
  try {
    const deletedGroup = await deleteGroup(req.body.id);
    res.json(deletedGroup);
  } catch (error) {
    console.log(error);
  }
}
