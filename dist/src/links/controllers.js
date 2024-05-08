import { createNewLink, deleteLinkFromDb, getSingleLink, getUserLinks, sortByCreation, sortByNameAsc, sortByNameDesc, updateLink, } from "./queries.js";
import { pool } from "../db.js";
export async function createLink(req, res) {
    const result = await createNewLink({
        original: req.body.original,
        short: req.body.short,
        description: req.body.description,
        created_by: req.user.id,
    });
    console.log(result);
    res.end();
}
export async function getAllLinks(req, res) {
    const links = await getUserLinks(req.user.id);
    res.json({ links: links.links?.rows });
}
export async function getLink(req, res) {
    console.log("get link", req.params);
    const link = await getSingleLink(req.params.id);
    await pool.query(`
    UPDATE links SET clicks = clicks + 1 WHERE id = $1
  `, [link?.rows[0].id]);
    console.log(link?.rows[0]);
    res.redirect(link?.rows[0].original);
    res.end();
}
export async function editLink(req, res) {
    console.log("e", req.body);
    const editedLink = await updateLink({ id: req.body.id, newData: req.body });
    console.log("el", editedLink);
    res.end();
}
export async function deleteLink(req, res) {
    console.log("delete link", req.body);
    const deletedLink = await deleteLinkFromDb(req.body.id);
    console.log("dl", deletedLink);
    res.end();
}
export async function sortLinks(req, res) {
    const { sort } = req.query;
    console.log("query", sort);
    res.end();
    switch (sort) {
        case "name_asc":
            const linksByNameAsc = await sortByNameAsc();
            res.json({ links: linksByNameAsc });
            return;
        case "name_desc":
            const linksByNameDesc = await sortByNameDesc();
            res.json({ links: linksByNameDesc });
            return;
        case "creation":
            const linksByCreation = await sortByCreation();
            res.json({ links: linksByCreation });
            return;
        default:
            return [];
    }
}
