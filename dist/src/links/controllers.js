import { createNewLink, deleteLinkFromDb, getSingleLink, getUserLinks, updateLink, } from "./queries.js";
export async function createLink(req, res) {
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
export async function getAllLinks(req, res) {
    console.log("get all", req.user);
    const links = await getUserLinks(req.user.id);
    console.log("all", links);
    res.json({ links: links.links?.rows });
}
export async function getLink(req, res) {
    console.log("get link", req.body);
    const link = await getSingleLink(req.body.short);
    console.log("og", link);
    res.end();
    // res.redirect(link);
}
export async function editLink(req, res) {
    console.log("edit link", req.body);
    const editedLink = await updateLink(req.body);
    console.log("el", editedLink);
    res.end();
}
export async function deleteLink(req, res) {
    console.log("delete link", req.body);
    const deletedLink = await deleteLinkFromDb(req.body.id);
    console.log("dl", deletedLink);
    res.end();
}
export { getSingleLink };
