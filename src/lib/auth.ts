import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.adminUsers,
            session: schema.adminSessions,
            account: schema.adminAccounts,
            verification: schema.adminVerifications,
        }
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true
    },
    plugins: [
        nextCookies()
    ],
    // Only allow admins to sign in/up conceptually, we'll probably restrict sign-up in production
    // or seed the first admin.
});
