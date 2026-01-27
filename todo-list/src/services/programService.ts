import { apiClient } from '@/lib/api-client';

export interface Program {
    id: number;
    orgId: number;
    title: string;
    status: string;
    deadline?: string | null;
    departments: string[];
    progress: number;
    description?: string | null;
    color?: string | null;
    startDate?: string | null;
    category?: string | null;
    isTemplate?: boolean | null;
    createdBy?: string | null;
    creator?: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        employee?: {
            department?: string | null;
        } | null;
    } | null;
    createdAt: string;
    updatedAt: string;
    projectManager?: string | null;
}

export interface NewProgram {
    title: string;
    status?: string;
    deadline?: string;
    departments?: string[];
    progress?: number;
    description?: string;
    color?: string;
    startDate?: string;
    category?: string;
    isTemplate?: boolean;
    projectManager?: string;
}

export const programService = {
    // Get all programs
    async getAll(search?: string): Promise<Program[]> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        const query = params.toString() ? `?${params.toString()}` : '';
        const response = await apiClient.get<Program[]>(`/programs${query}`);
        return response;
    },

    // Get single program
    async getById(id: number): Promise<Program> {
        const response = await apiClient.get<Program>(`/programs/${id}`);
        return response;
    },

    // Create program
    async create(data: NewProgram): Promise<Program> {
        const response = await apiClient.post<Program>('/programs', data);
        return response;
    },

    // Update program
    async update(id: number, data: Partial<NewProgram>): Promise<Program> {
        const response = await apiClient.put<Program>(`/programs/${id}`, data);
        return response;
    },

    // Delete program
    async delete(id: number): Promise<void> {
        await apiClient.delete(`/programs/${id}`);
    },

    // Get discussions for a program
    async getDiscussions(programId: number): Promise<Discussion[]> {
        const response = await apiClient.get<Discussion[]>(`/programs/${programId}/discussions`);
        return response;
    },

    // Create discussion
    async createDiscussion(programId: number, data: NewDiscussion): Promise<Discussion> {
        const response = await apiClient.post<Discussion>(`/programs/${programId}/discussions`, data);
        return response;
    },

    // Delete discussion
    async deleteDiscussion(programId: number, discussionId: number): Promise<void> {
        await apiClient.delete(`/programs/${programId}/discussions/${discussionId}`);
    },

    // Get Intelligence Report
    async getIntelligenceReport(programId: number): Promise<IntelligenceReport> {
        const response = await apiClient.get<IntelligenceReport>(`/programs/${programId}/intelligence-report`);
        return response;
    },

    // Vote on poll
    async votePoll(programId: number, discussionId: number, optionIds: string[]): Promise<Discussion> {
        const response = await apiClient.post<Discussion>(`/programs/${programId}/discussions/${discussionId}/vote`, { optionIds });
        return response;
    }
};

export interface IntelligenceReport {
    summary: string;
    collaborationLevel: 'high' | 'medium' | 'low';
    totalDiscussions: number;
    todayCount: number;
    departmentActivity: {
        department: string;
        count: number;
        users: number;
    }[];
    recentActivity: string[];
}

export interface Discussion {
    id: number;
    programId: number;
    userId: string;
    content: string;
    type?: string;
    tags?: string[];
    mediaUrl?: string | null;
    mediaType?: string | null;
    fileName?: string | null;
    fileSize?: string | null;
    metadata?: any; // Polls, Events
    parentId?: number | null;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        employee?: {
            department?: string | null;
        } | null;
    } | null;
    replies?: Discussion[];
}

export interface NewDiscussion {
    content: string;
    type?: string;
    tags?: string[];
    mediaUrl?: string;
    mediaType?: string;
    fileName?: string;
    fileSize?: string;
    metadata?: any;
    parentId?: number | null;
}
