import { Request, Response } from "express";

import {
  createNewLink,
  deleteLinkFromDb,
  getSingleLink,
  getUserLinks,
  updateLink,
} from "./queries.js";
import { parseCookies } from "oslo/cookie";

export async function createLink(req: Request, res: Response) {
  console.log("create", req.body);
  console.log(req.user);
  const result = await createNewLink({
    original: req.body.original,
    short: req.body.short,
    description: req.body.description,
    created_by: req.user.id,
  });
  console.log(result);
}

export async function getAllLinks(req: Request, res: Response) {
  console.log("get all", req.user);

  const links = await getUserLinks(req.user.id);
  console.log("all", links);
  res.json({ links: links.links?.rows });
}

export async function getLink(req: Request, res: Response) {
  console.log("get link", req.body);
  const link = await getSingleLink(req.body.short);
  console.log("og", link);
  res.end();
  // res.redirect(link);
}

export async function editLink(req: Request, res: Response) {
  console.log("edit link", req.body);
  const editedLink = await updateLink(req.body);
  console.log("el", editedLink);
  res.end();
}

export async function deleteLink(req: Request, res: Response) {
  console.log("delete link", req.body);
  const deletedLink = await deleteLinkFromDb(req.body.id);
  console.log("dl", deletedLink);
  res.end();
}
export { getSingleLink };
