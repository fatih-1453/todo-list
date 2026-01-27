export interface BigData {
    id: number;
    entryType?: 'Retail' | 'Canvassing';
    name: string; // Donor Name
    email?: string;
    phone?: string;
    address?: string;
    province?: string;
    district?: string;
    coordinate?: string;
    landmark?: string;

    placeName?: string;
    category?: string; // Retail Category or generic
    boxType?: string;
    officerName?: string;

    donorType?: string; // Retail or Canvassing Type
    donorSubType?: string;
    program?: string;
    result?: string;
    confirmationType?: string;

    status: string;
    source?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface Target {
    id: number;
    title: string;
    type: string;
    targetAmount: number; // or string if coming from numeric
    achievedAmount: number;
    startDate?: string;
    endDate?: string;
    assignedTo?: string;
    status: string;
    createdAt?: string;
    updatedAt?: string;
}
