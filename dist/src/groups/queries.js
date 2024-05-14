import { pool } from "../db.js";
export const createGroupDB = async (name, created_by, description, links) => {
    const group = await pool.query(`INSERT INTO groups(name,created_by,description) VALUES($1,$2,$3) RETURNING *`, [name, created_by, description]);
    if (links.length > 0) {
        links.forEach(async (li) => {
            await addLinksToGroup(li.id, group.rows[0].id);
        });
    }
};
export const getGroups = async (id) => {
    try {
        const groups = await pool.query(`
          SELECT * FROM groups WHERE created_by = $1
      `, [id]);
        return groups;
    }
    catch (error) {
        console.log("Error al obtener todos los grupos", error);
    }
};
export const getGroupLinks = async (group_id) => {
    try {
        const links = await pool.query(`
            SELECT * FROM links JOIN group_links ON links.id = group_links.link_id
            WHERE group_links.group_id = $1
        `, [group_id]);
        console.log("links dek grpu", links);
        return links;
    }
    catch (error) {
        console.log("f", error);
    }
};
export const addLinksToGroup = async (link, group) => {
    try {
        await pool.query(`
          INSERT INTO group_links(link_id, group_id) VALUES ($1, $2)
      `, [link, group]);
    }
    catch (error) {
        console.log("Error al agregar link al grupo", error);
    }
};
export const getGroupById = async (id) => {
    try {
        const { rows } = await pool.query(`
          SELECT * FROM groups WHERE id = $1
      `, [id]);
        console.log("parte g", rows[0]);
        const groupLinks = await getGroupLinks(rows[0].id);
        return {
            group: rows[0],
            group_links: groupLinks?.rows,
        };
    }
    catch (error) {
        console.log("error al obtener grupo", error);
    }
};
export const deleteLinksFromGroup = async (link_id) => {
    try {
        await pool.query(`
      DELETE FROM group_links WHERE link_id = $1
    `, [link_id]);
    }
    catch (error) {
        console.log("error al borrar del grupo", error);
    }
};
export const updateGroup = async (group_id, newName, newDescription) => {
    try {
        const updatedGroup = await pool.query(`
      UPDATE groups
      SET 
          name = CASE WHEN $1 <> '' THEN $1 ELSE name END,
          description = CASE WHEN $2 <> '' THEN $2 ELSE description END
      WHERE id = $3
      RETURNING *;
      
      `, [newName, newDescription, group_id]);
        return updatedGroup;
    }
    catch (error) {
        console.log("error al actualizar grupo", error);
    }
};
export const deleteGroup = async (group_id) => {
    try {
        await pool.query(`
    DELETE FROM group_links WHERE group_id = $1`, [group_id]);
        const deletedGroup = await pool.query(`
    DELETE FROM groups WHERE id = $1 RETURNING *
  `, [group_id]);
        return deletedGroup;
    }
    catch (error) {
        console.log("Error al borrar el grupo", error);
    }
};
