import { createGroupDB, getGroupById, getGroups } from "./queries.js";
export async function createGroup(req, res) {
    const { name, description, links } = req.body;
    console.log(name, description, links);
    try {
        await createGroupDB(name, req.user.id, description, links);
        res.end();
    }
    catch (error) {
        console.log(error);
    }
}
export async function getUserGroups(req, res) {
    try {
        const data = await getGroups(req.user.id);
        console.log("grupos", data);
        res.json(data);
    }
    catch (error) {
        console.log(error);
    }
}
export async function getSingleGroup(req, res) {
    try {
        console.log(req.params);
        const group = await getGroupById(req.params.id);
        console.log("completo", group);
        res.json(group);
    }
    catch (error) {
        console.log(error);
    }
}
