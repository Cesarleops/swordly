import { Lucia } from "lucia";
import { adapter } from "./schemas/user.js";
export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            // set to `true` when using HTTPS
            secure: process.env.NODE_ENV === "production",
        },
    },
});
