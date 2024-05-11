import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { Lucia } from "lucia";
import { pool } from "../db.js";
const adapter = new NodePostgresAdapter(pool, {
    user: "users",
    session: "sessions",
});
export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.pord === "PRODUCTION", // set `Secure` flag in HTTPS
        },
    },
    getUserAttributes: (attributes) => {
        return {
            githubId: attributes.github_id,
            username: attributes.username,
            links_amount: attributes.links_amount,
        };
    },
});
