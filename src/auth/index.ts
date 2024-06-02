import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { Lucia } from "lucia";
import { db } from "../db.js";
import { envConfig } from "../config/index.js";

const adapter = new NodePostgresAdapter(db, {
  user: "users",
  session: "sessions",
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,

    attributes: {
      sameSite: "none",
      domain: envConfig.clientUrl,
      secure: process.env.NODE_ENV !== "development", // set `Secure` flag in HTTPS
    },
  },
  getUserAttributes: (attributes) => {
    return {
      github_id: attributes.github_id,
      username: attributes.username,
      links_amount: attributes.links_amount,
      email: attributes.email,
      google_id: attributes.google_id,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      github_id: number;
      google_id: number;
      username: string;
      links_amount: number;
      email: string;
    };
  }
}
