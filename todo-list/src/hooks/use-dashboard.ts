"use client"

import { useQuery } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboard.service"

const DASHBOARD_KEY = ["dashboard"]

export function useDashboardStats() {
    return useQuery({
        queryKey: [...DASHBOARD_KEY, "stats"],
        queryFn: dashboardService.getStats,
    })
}

export function usePerformance() {
    return useQuery({
        queryKey: [...DASHBOARD_KEY, "performance"],
        queryFn: dashboardService.getPerformance,
    })
}

export function useWeeklyReport() {
    return useQuery({
        queryKey: [...DASHBOARD_KEY, "weekly-report"],
        queryFn: dashboardService.getWeeklyReport,
    })
}
