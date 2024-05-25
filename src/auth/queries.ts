import { db } from "../db.js";

export const register = async (id: string, email: string, password: string) => {
  try {
    await db.query(
      `
                INSERT INTO users(id, email,password_hash) VALUES ($1 ,$2, $3)
            `,
      [id, email, password],
    );
  } catch (error) {
    console.log(error);
  }
};

export const checkIfUserExists = async (email: string) => {
  try {
    const user = await db.query(
      `
                SELECT id, password_hash FROM users WHERE email = $1
            `,
      [email],
    );
    return user.rows[0];
  } catch (error) {
    console.log(error);
  }
};
