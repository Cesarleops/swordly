import { Request, Response } from "express";

import {
  createNewLink,
  deleteLinkFromDb,
  getSingleLink,
  getUserLinks,
  sortByCreation,
  sortByNameAsc,
  sortByNameDesc,
  textSearch,
  updateLink,
} from "./queries.js";
import { pool } from "../db.js";

export interface CustomRequest extends Request {
  user: {
    id: string;
    username: string;
    links_amount: number;
  };
}
export async function createLink(req: Request, res: Response) {
  try {
    const linkExists = await getSingleLink(req.body.short);
    if ((linkExists?.rows.length as number) > 0) {
      res.json({
        success: false,
        message: "The short link already exists",
      });
      return;
    }
    if ((req as CustomRequest).user.links_amount === 20) {
      res.json({
        success: false,
        message: "You already reached your limit links amount.",
      });
      return;
    }
    const result = await createNewLink({
      original: req.body.original,
      short: req.body.short,
      description: req.body.description,
      created_by: (req as CustomRequest).user.id,
    });
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getAllLinks(req: Request, res: Response) {
  try {
    const links = await getUserLinks((req as CustomRequest).user.id);
    res.json({
      success: true,
      links: links.links?.rows,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function getLink(req: Request, res: Response) {
  try {
    const link = await getSingleLink(req.params.id);
    res.status(302).setHeader("Location", link?.rows[0].original).end();

    if (req.headers.purpose !== "prefetch") {
      await pool.query(
        `
      UPDATE links SET clicks = clicks + 1 WHERE id = $1
    `,
        [link?.rows[0].id],
      );
    }
  } catch (error) {
    console.log(error);
  }
}

export async function editLink(req: Request, res: Response) {
  try {
    const editedLink = await updateLink({ id: req.body.id, newData: req.body });
    const updatedFields = Object.keys(req.body);
    console.log(updatedFields);
    res.json({
      editedLink,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function deleteLink(req: Request, res: Response) {
  try {
    const deletedLink = await deleteLinkFromDb(
      req.body.id,
      (req as CustomRequest).user.id,
    );
    res.json({
      deletedLink,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function sortLinks(req: Request, res: Response) {
  const { sort } = req.query;
  switch (sort) {
    case "name_asc":
      try {
        const linksByNameAsc = await sortByNameAsc();
        res.json({ links: linksByNameAsc?.rows });
        return;
      } catch (error) {
        console.log(error);
      }

    case "name_desc":
      try {
        const linksByNameDesc = await sortByNameDesc();
        res.json({ links: linksByNameDesc?.rows });
        return;
      } catch (error) {
        console.log(error);
      }

    case "creation":
      try {
        const linksByCreation = await sortByCreation();
        res.json({ links: linksByCreation });
        return;
      } catch (error) {
        console.log(error);
      }

    default:
      return [];
  }
}

export const searchLinkByText = async (req: Request, res: Response) => {
  const { text } = req.query;

  try {
    const matchedLink = await textSearch(text as string);
    res.json({
      links: matchedLink,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
