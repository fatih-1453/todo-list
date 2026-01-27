"use client"

import * as React from "react"
import { X, FolderPlus, Loader2, Check } from "lucide-react"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { fileService } from "@/services/fileService"

interface CreateFolderModalProps {
    isOpen: boolean
    onClose: () => void
    programId?: number
}

export function CreateFolderModal({ isOpen, onClose, programId }: CreateFolderModalProps) {
    const queryClient = useQueryClient()
    const [name, setName] = React.useState("")
    const [isSuccess, setIsSuccess] = React.useState(false)

    const createMutation = useMutation({
        mutationFn: async (folderName: string) => {
            return fileService.createFolder(folderName, programId)
        },
        onSuccess: () => {
            setIsSuccess(true)
            toast.success("Folder created successfully")
            queryClient.invalidateQueries({ queryKey: ['folders'] })

            setTimeout(() => {
                onClose()
                setName("")
                setIsSuccess(false)
            }, 1000)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        createMutation.mutate(name)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="font-bold text-gray-900 flex items-center gap-2">
                        <FolderPlus className="w-5 h-5 text-gray-500" />
                        New Folder
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Folder Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Finance, HR..."
                            className="w-full bg-gray-50 rounded-xl py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={!name.trim() || createMutation.isPending || isSuccess}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 flex items-center gap-2 ${isSuccess
                                ? "bg-green-500 text-white"
                                : "bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                                }`}
                        >
                            {createMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : isSuccess ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    Created!
                                </>
                            ) : (
                                "Create Folder"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
