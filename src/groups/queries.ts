import { QueryResult } from "pg";
import { pool } from "../db.js";

export const createGroupDB = async (
  name: string,
  created_by: string,
  description: string,
  links: { id: string }[],
) => {
  const group = await pool.query(
    `INSERT INTO groups(name,created_by,description) VALUES($1,$2,$3) RETURNING *`,
    [name, created_by, description],
  );
  console.log(group);

  if (links.length > 0) {
    console.log("links", links);
    links.forEach((li) => {
      addLinksToGroup(li.id, group.rows[0].id);
    });
  }
};

export const getGroups = async (id: string) => {
  const groups = await pool.query(
    `
        SELECT * FROM groups WHERE created_by = $1
    `,
    [id],
  );

  return groups;
};

export const getGroupLinks = async (group_id: string) => {
  console.log(" 2 id del grupo", group_id);
  try {
    const links = await pool.query(
      `
            SELECT * FROM links INNER JOIN group_links ON links.id = group_links.link_id
            WHERE group_links.id = $1
        `,
      [group_id],
    );
    return links;
  } catch (error) {
    console.log("f", error);
  }
};

export const addLinksToGroup = async (link: string, group: string) => {
  await pool.query(
    `
        INSERT INTO group_links(link_id, group_id) VALUES ($1, $2)
    `,
    [link, group],
  );
};

//para enocntrar los links de un grupo debo buscar los linnks cuyo group id sea el mismo del grupo.
// si tengo una tabla para guardar la relacion, es decir grupo-link, entonces debo buscar de la siguiente manera
// recupera los links cuyo id es igual al link_id de la tabla de la relacion y el group_id de la tabla relacion
// es igual al id del group

export const getGroupById = async (id: string) => {
  console.log(" 1 id del grupo", id);
  const { rows } = await pool.query(
    `
        SELECT * FROM groups WHERE id = $1
    `,
    [id],
  );
  console.log("parte g", rows[0]);

  const groupLinks = await getGroupLinks(rows[0].id);

  console.log("parte l", groupLinks.rows);
  return {
    group: rows[0],
    group_links: groupLinks.rows,
  };
};
