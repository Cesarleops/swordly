import { pool } from "../db.js";
export const getSingleLink = async (short) => {
    try {
        const link = await pool.query(`
            SELECT original FROM links WHERE short = $1
        `);
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
    console.log("aca", id);
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
export const deleteLinkFromDb = async (id) => {
    try {
        const deletedLink = await pool.query(`DELETE FROM links WHERE id=$1 RETURNING *`, [id]);
        return {
            ok: true,
            deletedLink,
        };
    }
    catch (error) {
        return {
            success: false,
            message: error.message,
        };
    }
};
export const updateLink = async ({ id, newData }) => {
    const updatedLink = await pool.query(`
        UPDATE links SET original= $1, short = $2, description = $3 WHERE id = $4 RETURNING *`, [newData.long, newData.short, newData.description, id]);
    return updatedLink;
};
