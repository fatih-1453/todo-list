export interface ActionPlan {
    id: number
    createdById?: string

    // Core
    plan: string // Maps to "Lead" column (Activity Name)
    program?: string
    div?: string // Division

    // People
    pic?: string // Nama
    position?: string // Jabatan
    subdivisi?: string
    department?: string
    executingAgency?: string // Div Pelaksana
    targetReceiver?: string // Target Penerima

    // Details
    notes?: string // Catatan
    indikator?: string
    lokasi?: string
    goal?: string // Tujuan
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
    realWeek1?: string // Used as Status (Done/In Progress)

    // Legacy / 4DX
    wig?: string
    lag?: string
    lead?: string
    risk?: string
}
