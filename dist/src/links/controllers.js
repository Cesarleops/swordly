import { createNewLink, deleteLinkFromDb, getSingleLink, getUserLinks, sortByCreation, sortByNameAsc, sortByNameDesc, textSearch, updateLink, } from "./queries.js";
import { db } from "../db.js";
export async function createLink(req, res) {
    try {
        const linkExists = await getSingleLink(req.body.short);
        if (linkExists?.rows.length > 0) {
            res.json({
                success: false,
                message: "The short link already exists",
            });
            return;
        }
        if (req.user.links_amount === 20) {
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
            created_by: req.user.id,
        });
        res.json({
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function getAllLinks(req, res) {
    try {
        const links = await getUserLinks(req.user.id);
        res.json({
            success: true,
            links: links.links?.rows,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function getLink(req, res) {
    try {
        const link = await getSingleLink(req.params.id);
        res.status(302).setHeader("Location", link?.rows[0].original).end();
        if (req.headers.purpose !== "prefetch") {
            await db.query(`
      UPDATE links SET clicks = clicks + 1 WHERE id = $1
    `, [link?.rows[0].id]);
        }
    }
    catch (error) {
        console.log(error);
    }
}
export async function editLink(req, res) {
    try {
        const editedLink = await updateLink({ id: req.body.id, newData: req.body });
        const updatedFields = Object.keys(req.body);
        console.log(updatedFields);
        res.json({
            editedLink,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function deleteLink(req, res) {
    try {
        const deletedLink = await deleteLinkFromDb(req.body.id, req.user.id);
        res.json({
            deletedLink,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function sortLinks(req, res) {
    const { sort } = req.query;
    switch (sort) {
        case "name_asc":
            try {
                const linksByNameAsc = await sortByNameAsc();
                res.json({ links: linksByNameAsc?.rows });
                return;
            }
            catch (error) {
                console.log(error);
            }
        case "name_desc":
            try {
                const linksByNameDesc = await sortByNameDesc();
                res.json({ links: linksByNameDesc?.rows });
                return;
            }
            catch (error) {
                console.log(error);
            }
        case "creation":
            try {
                const linksByCreation = await sortByCreation();
                res.json({ links: linksByCreation });
                return;
            }
            catch (error) {
                console.log(error);
            }
        default:
            return [];
    }
}
export const searchLinkByText = async (req, res) => {
    const { text } = req.query;
    try {
        const matchedLink = await textSearch(text);
        res.json({
            links: matchedLink,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
};
