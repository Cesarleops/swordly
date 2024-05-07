import pg from "pg";

export const pool = new pg.Pool({
  connectionString: process.env.DB_URL as string,
});

export const dbInit = async () => {
  try {
    await pool.query(`
    DROP TABLE IF EXISTS links`);

    await pool.query(`
    CREATE TABLE links (
      id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
      original TEXT,
      short VARCHAR(10) UNIQUE,
      description TEXT,
      created_at TIMESTAMP,
      clicks INTEGER,
      created_by TEXT REFERENCES users(id)
    );
  `);

    console.log("done");
  } catch (error) {
    console.error("Error during database initialization:", error);
    throw error; // Rethrow the error to propagate it upwards
  }
};
