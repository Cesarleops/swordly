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

  if (links.length > 0) {
    links.forEach(async (li) => {
      await addLinksToGroup(li.id, group.rows[0].id);
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
  console.log(" id del grupo", group_id);
  try {
    const links = await pool.query(
      `
            SELECT * FROM links JOIN group_links ON links.id = group_links.link_id
            WHERE group_links.group_id = $1
        `,
      [group_id],
    );
    console.log("links dek grpu", links);
    return links;
  } catch (error) {
    console.log("f", error);
  }
};

export const addLinksToGroup = async (link: string, group: string) => {
  console.log("link individual", link);
  await pool.query(
    `
        INSERT INTO group_links(link_id, group_id) VALUES ($1, $2)
    `,
    [link, group],
  );
};

export const getGroupById = async (id: string) => {
  const { rows } = await pool.query(
    `
        SELECT * FROM groups WHERE id = $1
    `,
    [id],
  );
  console.log("parte g", rows[0]);

  const groupLinks = await getGroupLinks(rows[0].id);

  console.log("parte l", groupLinks);
  return {
    group: rows[0],
    group_links: groupLinks?.rows,
  };
};
