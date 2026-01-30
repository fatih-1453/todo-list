export interface ActionPlan {
    id: number
    createdById?: string
    orgId?: string

    // Core
    lead: string // Activity Name (previously plan)
    program?: string
    goal?: string // Tujuan

    // Organization
    divisi?: string // Division (previously div)
    subdivisi?: string
    department?: string
    executingAgency?: string // Div Pelaksana
    position?: string // Jabatan
    pic?: string // Person In Charge (Nama)
    targetReceiver?: string // Target Penerima

    // Details(Context)
    indikator?: string
    lokasi?: string
    classification?: string // Klasifikasi Pelaksanaan

    // Dates
    startDate?: string
    endDate?: string
    dueDate?: string

    // Metrics
    targetActivity?: number // Target Kegiatan
    realActivity?: number // Realisasi Kegiatan
    targetNominal?: number | string
    realNominal?: number | string

    // Status / Tracking
    status?: string // (Done/In Progress)
    notes?: string // Catatan
    risk?: string // SDM & Risk analysis

    createdAt?: string
    updatedAt?: string
}
