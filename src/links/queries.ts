import { db } from "../db.js";

type Link = {
  original: string;
  short: string;
  description?: string;
  created_by: string;
};

export const getSingleLink = async (short: string) => {
  try {
    const link = await db.query(
      `
            SELECT id, original,clicks FROM links WHERE short = $1 
        `,
      [short],
    );
    return link;
  } catch (error) {
    console.log("get link error", error);
  }
};
export const createNewLink = async ({
  original,
  short,
  description,
  created_by,
}: Link) => {
  try {
    await db.query(
      `
                    INSERT INTO links(original,short,description,created_by) VALUES (
                      $1,
                      $2,
                      $3,
                      $4
                    ) RETURNING * 
                  `,
      [original, short, description, created_by],
    );
    await db.query(
      `
        UPDATE users SET links_amount = links_amount + 1 WHERE id = $1
      `,
      [created_by],
    );
    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getUserLinks = async (id: string) => {
  try {
    const allLinks = await db.query(
      `
                SELECT * FROM links WHERE created_by = $1
              `,
      [id],
    );
    return {
      success: true,
      links: allLinks,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const deleteLinkFromDb = async (id: string, created_by: string) => {
  try {
    const deletedLink = await db.query(
      `DELETE FROM links WHERE id=$1 RETURNING *`,
      [id],
    );
    await db.query(
      `
     UPDATE users SET links_amount = links_amount - 1 WHERE id = $1
    `,
      [created_by],
    );
    return deletedLink.rows[0];
  } catch (error: any) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const updateLink = async ({ id, newData }: any) => {
  try {
    const updatedLink = await db.query(
      `
      UPDATE links
      SET 
          original = CASE WHEN $1 <> '' THEN $1 ELSE original END,
          short = CASE WHEN $2 <> '' THEN $2 ELSE short END,
          description = CASE WHEN $3 <> '' THEN $3 ELSE description END
      WHERE id = $4
      RETURNING *;
      
      `,
      [newData.original, newData.short, newData.description, id],
    );

    return updatedLink.rows[0];
  } catch (error) {
    console.log(error);
  }
};

export const sortByCreation = async () => {
  try {
    const links = await db.query(`
    SELECT * FROM links ORDER BY created_at DESC
    `);

    return links;
  } catch (error) {
    console.log(error);
  }
};

export const sortByNameAsc = async () => {
  try {
    const links = await db.query(`
    SELECT * FROM links ORDER BY short ASC
    `);

    return links;
  } catch (error) {
    console.log(error);
  }
};

export const sortByNameDesc = async () => {
  try {
    const links = await db.query(`
  SELECT * FROM links ORDER BY short DESC
  `);

    return links;
  } catch (error) {
    console.log(error);
  }
};

export const textSearch = async (text: string) => {
  try {
    const data = await db.query(
      `
      SELECT * FROM links WHERE short LIKE '%' || $1 || '%'
    `,
      [text],
    );

    return data.rows;
  } catch (error) {
    console.log(error);
  }
};
