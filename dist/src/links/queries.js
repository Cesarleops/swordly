import { pool } from "../db.js";
export const getSingleLink = async (short) => {
    try {
        const link = await pool.query(`
            SELECT id, original,clicks FROM links WHERE short = $1 
        `, [short]);
        return link;
    }
    catch (error) {
        console.log("get link error", error);
    }
};
export const createNewLink = async ({ original, short, description, created_by, }) => {
    try {
        await pool.query(`
                    INSERT INTO links(original,short,description,created_by) VALUES (
                      $1,
                      $2,
                      $3,
                      $4
                    ) RETURNING * 
                  `, [original, short, description, created_by]);
        await pool.query(`
        UPDATE users SET links_amount = links_amount + 1 WHERE id = $1
      `, [created_by]);
        return {
            success: true,
        };
    }
    catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};
export const getUserLinks = async (id) => {
    try {
        const allLinks = await pool.query(`
                SELECT * FROM links WHERE created_by = $1
              `, [id]);
        return {
            success: true,
            links: allLinks,
        };
    }
    catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};
export const deleteLinkFromDb = async (id, created_by) => {
    try {
        const deletedLink = await pool.query(`DELETE FROM links WHERE id=$1 RETURNING *`, [id]);
        await pool.query(`
     UPDATE users SET links_amount = links_amount - 1 WHERE id = $1
    `, [created_by]);
        return deletedLink.rows[0];
    }
    catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};
export const updateLink = async ({ id, newData }) => {
    try {
        const updatedLink = await pool.query(`
      UPDATE links
      SET 
          original = CASE WHEN $1 <> '' THEN $1 ELSE original END,
          short = CASE WHEN $2 <> '' THEN $2 ELSE short END,
          description = CASE WHEN $3 <> '' THEN $3 ELSE description END
      WHERE id = $4
      RETURNING *;
      
      `, [newData.original, newData.short, newData.description, id]);
        return updatedLink.rows[0];
    }
    catch (error) {
        console.log(error);
    }
};
export const sortByCreation = async () => {
    try {
        const links = await pool.query(`
    SELECT * FROM links ORDER BY created_at DESC
    `);
        return links;
    }
    catch (error) {
        console.log(error);
    }
};
export const sortByNameAsc = async () => {
    try {
        const links = await pool.query(`
    SELECT * FROM links ORDER BY short ASC
    `);
        return links;
    }
    catch (error) {
        console.log(error);
    }
};
export const sortByNameDesc = async () => {
    try {
        const links = await pool.query(`
  SELECT * FROM links ORDER BY short DESC
  `);
        return links;
    }
    catch (error) {
        console.log(error);
    }
};
export const textSearch = async (text) => {
    try {
        const data = await pool.query(`
      SELECT * FROM links WHERE short LIKE '%' || $1 || '%'
    `, [text]);
        return data.rows;
    }
    catch (error) {
        console.log(error);
    }
};
