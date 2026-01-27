import { apiClient } from "@/lib/api-client";

export interface Folder {
    id: number;
    name: string;
    orgId: number;
    createdById: string;
    createdAt: string;
}

export interface FileRecord {
    id: number;
    name: string;
    size: string;
    type: string;
    path: string;
    folderId?: number;
    orgId: number;
    uploadedById: string;
    createdAt: string;
    uploader?: {
        name: string;
        employee?: {
            department?: string;
        }
    }
}

export const fileService = {
    // Folders
    getFolders: async (programId?: number) => {
        const query = programId ? `?programId=${programId}` : "";
        return apiClient.get<Folder[]>(`/files/folders${query}`);
    },

    createFolder: async (name: string, programId?: number) => {
        return apiClient.post<Folder>("/files/folders", { name, programId });
    },

    deleteFolder: async (id: number) => {
        return apiClient.delete(`/files/folders/${id}`);
    },

    // Files
    getFiles: async (folderId?: number, programId?: number) => {
        const params = new URLSearchParams();
        if (folderId) params.append("folderId", folderId.toString());
        if (programId) params.append("programId", programId.toString());
        return apiClient.get<FileRecord[]>(`/files?${params.toString()}`);
    },

    createFileRecord: async (formData: FormData) => {
        return apiClient.post<FileRecord>("/files", formData);
    },

    deleteFile: async (id: number) => {
        return apiClient.delete(`/files/${id}`);
    }
};
