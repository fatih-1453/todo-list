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
        'https://ravishing-presence-production-6778.up.railway.app',
    ],
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001/api/auth",
    advanced: {
        defaultCookieAttributes: {
            secure: true, // Always secure for modern cross-site auth
            sameSite: 'none', // Always none for cross-site auth
        },
        useSecureCookies: true, // Force secure cookies logic in better-auth
    },
});
