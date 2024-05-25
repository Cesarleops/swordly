import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { Lucia } from "lucia";
import { db } from "../db.js";
const adapter = new NodePostgresAdapter(db, {
    user: "users",
    session: "sessions",
});
export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: process.env.prod === "PRODUCTION", // set `Secure` flag in HTTPS
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
