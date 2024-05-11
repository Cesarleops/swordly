import { createNewLink, deleteLinkFromDb, getSingleLink, getUserLinks, sortByCreation, sortByNameAsc, sortByNameDesc, textSearch, updateLink, } from "./queries.js";
import { pool } from "../db.js";
export async function createLink(req, res) {
    try {
        const result = await createNewLink({
            original: req.body.original,
            short: req.body.short,
            description: req.body.description,
            created_by: req.user.id,
        });
        console.log(result);
        res.end();
    }
    catch (error) {
        console.log(error);
    }
}
export async function getAllLinks(req, res) {
    try {
        const links = await getUserLinks(req.user.id);
        res.json({ links: links.links?.rows });
    }
    catch (error) {
        console.log(error);
    }
}
export async function getLink(req, res) {
    try {
        const link = await getSingleLink(req.params.id);
        console.log("single link", link?.rows[0].original);
        res.status(302).setHeader("Location", link?.rows[0].original).end();
        if (req.headers.purpose !== "prefetch") {
            await pool.query(`
      UPDATE links SET clicks = clicks + 1 WHERE id = $1
    `, [link?.rows[0].id]);
        }
    }
    catch (error) {
        console.log(error);
    }
}
export async function editLink(req, res) {
    console.log("e", req.body);
    try {
        const editedLink = await updateLink({ id: req.body.id, newData: req.body });
        console.log("el", editedLink);
        res.end();
    }
    catch (error) {
        console.log(error);
    }
}
export async function deleteLink(req, res) {
    console.log("delete link", req.body);
    const deletedLink = await deleteLinkFromDb(req.body.id, req.user.id);
    console.log("dl", deletedLink);
    res.end();
}
export async function sortLinks(req, res) {
    const { sort } = req.query;
    console.log("query", sort);
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
    console.log("t", text);
    const matchedLink = await textSearch(text);
    console.log("m", matchedLink);
    res.json({
        links: matchedLink,
    });
};
