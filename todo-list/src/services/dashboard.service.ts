import { apiClient } from "@/lib/api-client"

export interface DashboardStats {
    totalTasks: number
    completedTasks: number
    pendingTasks: number
    highPriorityTasks: number
    completionRate: number
}

export interface PerformanceData {
    tasksDone: number
    tasksOngoing: number
    hoursSaved: number | string
}

export interface WeeklyReportDay {
    day: string
    count: number
    done: number
    ongoing: number
}

export const dashboardService = {
    getStats: () => apiClient.get<DashboardStats>("/dashboard/stats"),

    getPerformance: () => apiClient.get<PerformanceData>("/dashboard/performance"),

    getWeeklyReport: () => apiClient.get<WeeklyReportDay[]>("/dashboard/weekly-report"),
}

