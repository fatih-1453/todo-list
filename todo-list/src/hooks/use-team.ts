"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { teamService, TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from "@/services/team.service"

const TEAM_KEY = ["team"]

export function useTeam() {
    return useQuery({
        queryKey: TEAM_KEY,
        queryFn: teamService.getAll,
    })
}

export function useTeamMember(id: number) {
    return useQuery({
        queryKey: [...TEAM_KEY, id],
        queryFn: () => teamService.getById(id),
        enabled: !!id,
    })
}

export function useCreateTeamMember() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTeamMemberInput) => teamService.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEY })
        },
    })
}

export function useUpdateTeamMember() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateTeamMemberInput }) =>
            teamService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEY })
        },
    })
}

export function useUpdateTeamMemberStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: TeamMember["status"] }) =>
            teamService.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEY })
        },
    })
}

export function useDeleteTeamMember() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => teamService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: TEAM_KEY })
        },
    })
}
