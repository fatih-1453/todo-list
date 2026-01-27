import { Request, Response } from 'express';

// Type-safe route parameter interfaces
export interface IdParams {
    id: string;
}

// Re-export types from schema
export type { User, NewUser } from '../db/schema/users';
export type { Session, Account, Verification } from '../db/schema/sessions';
export type { Task, NewTask, Tag, NewTag } from '../db/schema/tasks';
export type { TeamMember, NewTeamMember } from '../db/schema/team-members';
export type { Reminder, NewReminder } from '../db/schema/reminders';
export type { ChatConversation, NewChatConversation, ChatMessage, NewChatMessage } from '../db/schema/chat';
export type { PerformanceStat, NewPerformanceStat } from '../db/schema/performance';
