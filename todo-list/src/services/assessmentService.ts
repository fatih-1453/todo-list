import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";

export interface AssessmentSubtask {
    id: number;
    text: string;
    completed: boolean;
}

export interface Assessment {
    id: number;
    title: string;
    status: 'new' | 'acc_direksi' | 'progress' | 'complete';
    tag?: string;
    tagColor?: string;
    dueDate?: string;
    description?: string;
    cover?: string;
    assignee?: User; // fetched via relation
    subtasks?: AssessmentSubtask[];
    files?: any[]; // Replace with File interface if available
    comments?: any[]; // Replace with Comment interface
}

export const assessmentService = {
    getAll: async () => {
        return apiClient.get<Assessment[]>("/assessments");
    },

    create: async (data: FormData | {
        title: string;
        tag?: string;
        tagColor?: string; // hex or class
        dueDate?: string;
        subtasks?: string[];
        assigneeId?: string;
    }) => {
        return apiClient.post<Assessment>("/assessments", data);
    },

    updateStatus: async (id: number, status: 'new' | 'acc_direksi' | 'progress' | 'complete') => {
        return apiClient.put<Assessment>(`/assessments/${id}/status`, { status });
    },

    toggleSubtask: async (id: number, completed: boolean) => {
        return apiClient.patch<AssessmentSubtask>(`/assessments/subtasks/${id}`, { completed });
    },

    delete: async (id: number) => {
        return apiClient.delete(`/assessments/${id}`);
    },

    addComment: async (id: number, text: string) => {
        return apiClient.post(`/assessments/${id}/comments`, { text });
    }
};
