import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import pg from "pg";

const pool = new pg.Pool();

export const adapter = new NodePostgresAdapter(pool, {
  user: "auth_user",
  session: "user_session",
});
