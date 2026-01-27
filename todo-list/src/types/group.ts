export interface Group {
    id: number;
    name: string;
    permissions: string[]; // Array of menu keys, e.g., ["dashboard_utama", "penerimaan"]
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface CreateGroupDTO {
    name: string;
    permissions: string[];
    status: 'active' | 'inactive';
}
