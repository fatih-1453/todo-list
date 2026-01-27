export interface Employee {
    id: number;
    orgId: number;
    department?: string | null;
    position?: string | null;
    location?: string | null;
    nip?: string | null;
    name: string;
    nickname?: string | null;
    frontTitle?: string | null;
    backTitle?: string | null;
    nik?: string | null;
    placeOfBirth?: string | null;
    dateOfBirth?: string | null; // ISO Date string YYYY-MM-DD
    gender?: 'Laki-laki' | 'Perempuan' | null;
    religion?: string | null;
    phoneNumber?: string | null;
    email?: string | null;
    address?: string | null;
    rt?: string | null;
    rw?: string | null;
    postalCode?: string | null;
    province?: string | null;
    city?: string | null;
    district?: string | null;
    village?: string | null;
    photoUrl?: string | null;
    joinDate?: string | null;
    status: 'Active' | 'Inactive' | 'Leave';
    createdAt: string;
    updatedAt: string;
}

export interface NewEmployee {
    name: string;
    department?: string;
    position?: string;
    location?: string;
    nip?: string;
    nickname?: string;
    frontTitle?: string;
    backTitle?: string;
    nik?: string;
    placeOfBirth?: string;
    dateOfBirth?: string;
    gender?: 'Laki-laki' | 'Perempuan';
    religion?: string;
    phoneNumber?: string;
    email?: string;
    address?: string;
    rt?: string;
    rw?: string;
    postalCode?: string;
    province?: string;
    city?: string;
    district?: string;
    village?: string;
    photoUrl?: string;
    joinDate?: string;
    status?: 'Active' | 'Inactive' | 'Leave';
}
