import { addLinksToGroup, createGroupDB, deleteGroup, getGroupById, getGroupByName, getGroups, updateGroup, } from "./queries.js";
export async function createGroup(req, res) {
    const { name, description, links } = req.body;
    try {
        const checkIfNameExists = await getGroupByName(name);
        if (checkIfNameExists) {
            res.json({
                success: false,
                message: "You already have a group with this name. Please try another one",
            });
            return;
        }
        await createGroupDB(name, req.user.id, description, links);
        res.json({
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function getUserGroups(req, res) {
    try {
        console.log("vengo por los grupos");
        const data = await getGroups(req.user.id);
        res.json({
            success: true,
            groups: data,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function getSingleGroup(req, res) {
    try {
        const group = await getGroupById(req.params.id);
        res.json({ success: true, group });
    }
    catch (error) {
        console.log(error);
    }
}
export async function updateGroupHandler(req, res) {
    try {
        const { name, description, id, new_links } = req.body;
        console.log("lo que edito", req.body);
        const checkIfNameExists = await getGroupByName(name);
        const checkSameGroup = await getGroupById(id);
        if (!checkSameGroup?.group.name === name && checkIfNameExists) {
            res.json({
                success: false,
                message: "You already have a group with this name. Please try another one",
            });
            return;
        }
        const group = await updateGroup(id, name, description, new_links);
        res.json({
            success: true,
            group,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function deleteGroupHandler(req, res) {
    console.log("body del delete", req.body);
    try {
        const deletedGroup = await deleteGroup(req.body.id);
        res.json({
            success: true,
            deletedGroup,
        });
    }
    catch (error) {
        console.log(error);
    }
}
export async function addNewLinksToGroup(req, res) {
    const [group_id, link_id] = req.body;
    try {
        await addLinksToGroup(link_id, group_id);
    }
    catch (error) {
        console.log(error);
    }
}
