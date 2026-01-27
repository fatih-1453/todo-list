import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from "better-auth/plugins";
import { db } from './database';
import * as schema from '../db/schema';

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user: schema.users,
            session: schema.sessions,
            account: schema.accounts,
            verification: schema.verifications,
            organization: schema.organizations,
            member: schema.organizationMembers,
            invitation: schema.invitations,
        },
    }),
    emailAndPassword: {
        enabled: true,
    },
    plugins: [
        organization()
    ],
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
    },
    trustedOrigins: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        // 'http://192.168.11.106:3000', // Covered by FRONTEND_URL
    ],
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001/api/auth",
    advanced: {
        defaultCookieAttributes: {
            secure: false,
        },
    },
});
