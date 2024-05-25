import pg from "pg";

export const db = new pg.Pool({
  connectionString: process.env.DB_URL as string,
});

export const dbInit = async () => {
  try {
    await db.query(`
    DROP TABLE IF EXISTS links CASCADE`);
    await db.query(`
    DROP TABLE IF EXISTS group_links`);

    await db.query(`
    DROP TABLE IF EXISTS groups`);

    await db.query(`
      UPDATE users SET links_amount = 0 
    `);

    await db.query(`
    CREATE TABLE links (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      original TEXT,
      short VARCHAR(10) UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      clicks INTEGER DEFAULT 0,
      created_by TEXT REFERENCES users(id)
    );
  `);

    await db.query(`
    CREATE TABLE groups(
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      name VARCHAR(255),
      created_by TEXT REFERENCES users(id) ,
      created_at TIMESTAMP DEFAULT NOW(),
      description VARCHAR(255)

    )
  `);

    await db.query(`
    CREATE TABLE group_links(
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      link_id INTEGER REFERENCES links(id),
      group_id INTEGER REFERENCES groups(id) 
      )
    `);

    await db.query(`
    CREATE INDEX slug ON links(short)
   `);

    console.log("done");
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error; // Rethrow the error to propagate it upwards
  }
};
