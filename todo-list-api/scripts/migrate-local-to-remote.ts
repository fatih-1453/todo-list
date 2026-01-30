import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/db/schema';
import { sql } from 'drizzle-orm';

// 1. Setup Connections
const localPool = new Pool({ connectionString: process.env.DATABASE_URL });
const remotePool = new Pool({ connectionString: process.env.PRODUCTION_DATABASE_URL });

const localDb = drizzle(localPool, { schema });
const remoteDb = drizzle(remotePool, { schema });

async function migrateData() {
    console.log('🚀 Starting FULL migration...');

    if (!process.env.PRODUCTION_DATABASE_URL || process.env.PRODUCTION_DATABASE_URL.includes('railway.internal')) {
        console.error('❌ ERROR: It looks like you are using the INTERNAL Railway URL.');
        process.exit(1);
    }

    try {
        // --- 1. Base Tables (No dependencies) ---
        console.log('📦 Migrating Organizations...');
        const orgs = await localDb.query.organizations.findMany();
        if (orgs.length > 0) await remoteDb.insert(schema.organizations).values(orgs).onConflictDoNothing();

        console.log('📦 Migrating Groups...');
        const groups = await localDb.query.groups.findMany();
        if (groups.length > 0) await remoteDb.insert(schema.groups).values(groups).onConflictDoNothing();

        console.log('📦 Migrating Departments...');
        const departments = await localDb.query.departments.findMany();
        if (departments.length > 0) await remoteDb.insert(schema.departments).values(departments).onConflictDoNothing();

        console.log('📦 Migrating Positions...');
        const positions = await localDb.query.positions.findMany();
        if (positions.length > 0) await remoteDb.insert(schema.positions).values(positions).onConflictDoNothing();

        // --- 2. Users & Employees ---
        console.log('📦 Migrating Employees...');
        const employees = await localDb.query.employees.findMany();
        if (employees.length > 0) await remoteDb.insert(schema.employees).values(employees).onConflictDoNothing();

        console.log('📦 Migrating Users...');
        const users = await localDb.query.users.findMany();
        if (users.length > 0) await remoteDb.insert(schema.users).values(users).onConflictDoNothing();

        // --- 3. Auth & Identity ---
        console.log('📦 Migrating Accounts...');
        const accounts = await localDb.query.accounts.findMany();
        if (accounts.length > 0) await remoteDb.insert(schema.accounts).values(accounts).onConflictDoNothing();

        console.log('📦 Migrating Sessions...');
        const sessions = await localDb.query.sessions.findMany();
        if (sessions.length > 0) await remoteDb.insert(schema.sessions).values(sessions).onConflictDoNothing();

        // --- 4. Relationships ---
        console.log('📦 Migrating Members...');
        const members = await localDb.query.organizationMembers.findMany();
        if (members.length > 0) await remoteDb.insert(schema.organizationMembers).values(members).onConflictDoNothing();

        // --- 5. Content ---
        console.log('📦 Migrating Programs...');
        const programs = await localDb.query.programs.findMany();
        if (programs.length > 0) await remoteDb.insert(schema.programs).values(programs).onConflictDoNothing();

        console.log('📦 Migrating Program Discussions...');
        const pDiscussions = await localDb.query.programDiscussions.findMany();
        if (pDiscussions.length > 0) await remoteDb.insert(schema.programDiscussions).values(pDiscussions).onConflictDoNothing();

        console.log('📦 Migrating Tags...');
        const tags = await localDb.query.tags.findMany();
        if (tags.length > 0) await remoteDb.insert(schema.tags).values(tags).onConflictDoNothing();

        console.log('📦 Migrating Tasks...');
        const tasks = await localDb.query.tasks.findMany();
        if (tasks.length > 0) await remoteDb.insert(schema.tasks).values(tasks).onConflictDoNothing();

        console.log('📦 Migrating Task Tags...');
        const taskTags = await localDb.query.taskTags.findMany();
        if (taskTags.length > 0) await remoteDb.insert(schema.taskTags).values(taskTags).onConflictDoNothing();

        console.log('📦 Migrating Action Plans...');
        const actionPlans = await localDb.query.actionPlans.findMany();
        if (actionPlans.length > 0) await remoteDb.insert(schema.actionPlans).values(actionPlans).onConflictDoNothing();

        console.log('📦 Migrating Reminders...');
        const reminders = await localDb.query.reminders.findMany();
        if (reminders.length > 0) await remoteDb.insert(schema.reminders).values(reminders).onConflictDoNothing();

        console.log('📦 Migrating Performance Stats...');
        const perf = await localDb.query.performanceStats.findMany();
        if (perf.length > 0) await remoteDb.insert(schema.performanceStats).values(perf).onConflictDoNothing();

        console.log('📦 Migrating Assessments...');
        const assessments = await localDb.query.assessments.findMany();
        if (assessments.length > 0) await remoteDb.insert(schema.assessments).values(assessments).onConflictDoNothing();

        // Check for subtasks table
        if (schema.assessmentSubtasks) {
            const subtasks = await localDb.query.assessmentSubtasks.findMany();
            if (subtasks.length > 0) await remoteDb.insert(schema.assessmentSubtasks).values(subtasks).onConflictDoNothing();
        }

        console.log('📦 Migrating Folders...');
        const folders = await localDb.query.folders.findMany();
        if (folders.length > 0) await remoteDb.insert(schema.folders).values(folders).onConflictDoNothing();

        console.log('📦 Migrating Files...');
        const files = await localDb.query.files.findMany();
        if (files.length > 0) await remoteDb.insert(schema.files).values(files).onConflictDoNothing();

        console.log('📦 Migrating Chat Conversations...');
        const chatConvos = await localDb.query.chatConversations.findMany();
        if (chatConvos.length > 0) await remoteDb.insert(schema.chatConversations).values(chatConvos).onConflictDoNothing();

        console.log('📦 Migrating Chat Participants...');
        const chatParts = await localDb.query.chatParticipants.findMany();
        if (chatParts.length > 0) await remoteDb.insert(schema.chatParticipants).values(chatParts).onConflictDoNothing();

        console.log('📦 Migrating Chat Messages...');
        const chatMsgs = await localDb.query.chatMessages.findMany();
        if (chatMsgs.length > 0) await remoteDb.insert(schema.chatMessages).values(chatMsgs).onConflictDoNothing();

        console.log('✨ FULL Migration complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        console.error('   Details:', error.message);
    } finally {
        await localPool.end();
        await remotePool.end();
    }
}

migrateData();
