"use client"

import * as React from "react"
import {
    Folder,
    FileText,
    ChevronRight,
    Download,
    MoreVertical,
    Trash2,
    HardDrive,
    FolderPlus,
    Upload,
    ArrowLeft
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fileService, Folder as FolderType, FileRecord } from "@/services/fileService"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { toast } from "sonner"
import { CreateFolderModal } from "@/components/files/CreateFolderModal"

interface ResourcesViewProps {
    programId: number
}

export function ResourcesView({ programId }: ResourcesViewProps) {
    const queryClient = useQueryClient()
    const [currentFolder, setCurrentFolder] = React.useState<FolderType | null>(null)
    const [isCreateFolderOpen, setIsCreateFolderOpen] = React.useState(false)

    // Upload State
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const { data: folders, isLoading: foldersLoading } = useQuery({
        queryKey: ['folders', programId],
        queryFn: () => fileService.getFolders(programId)
    })

    const { data: allFiles, isLoading: filesLoading } = useQuery({
        queryKey: ['files', programId],
        queryFn: () => fileService.getFiles(undefined, programId)
    })

    // Filter files for current view
    const currentFiles = React.useMemo(() => {
        if (!allFiles) return []
        if (currentFolder) {
            return allFiles.filter(f => f.folderId === currentFolder.id)
        }
        return allFiles.filter(f => !f.folderId) // Root files
    }, [allFiles, currentFolder])

    // Filter folders for current view (assuming flat folders for now, or root folders)
    // If folders are recursive, we'd filter by parentId. But current schema is flat folders list for program.
    // So we show ALL folders at root level? Or do we have folders inside folders?
    // Current schema `folders` table does NOT have `parentId`. So it's a flat list of folders.
    // So if `currentFolder` is set, we show FILES inside it. We don't show sub-folders (as they don't exist yet).
    const showFolders = !currentFolder;

    // Mutations
    const uploadMutation = useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('programId', programId.toString())
            if (currentFolder) {
                formData.append('folderId', currentFolder.id.toString())
            }
            return fileService.createFileRecord(formData)
        },
        onSuccess: () => {
            toast.success("File uploaded successfully")
            queryClient.invalidateQueries({ queryKey: ['files', programId] })
        },
        onError: () => {
            toast.error("Failed to upload file")
        }
    })

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            uploadMutation.mutate(e.target.files[0])
        }
    }

    const deleteFileMutation = useMutation({
        mutationFn: fileService.deleteFile,
        onSuccess: () => {
            toast.success("File deleted")
            queryClient.invalidateQueries({ queryKey: ['files', programId] })
        }
    })

    const deleteFolderMutation = useMutation({
        mutationFn: fileService.deleteFolder,
        onSuccess: () => {
            toast.success("Folder deleted")
            queryClient.invalidateQueries({ queryKey: ['folders', programId] })
        }
    })

    if (foldersLoading || filesLoading) {
        return <div className="p-8 text-center text-gray-500">Loading resources...</div>
    }

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    {currentFolder ? (
                        <>
                            <button
                                onClick={() => setCurrentFolder(null)}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-500 cursor-pointer hover:text-black" onClick={() => setCurrentFolder(null)}>Resources</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                <span className="font-bold text-gray-900 flex items-center gap-2">
                                    <Folder className="w-4 h-4 text-blue-500" />
                                    {currentFolder.name}
                                </span>
                            </div>
                        </>
                    ) : (
                        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                            <HardDrive className="w-5 h-5 text-gray-400" />
                            Program Resources
                        </h3>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreateFolderOpen(true)}
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-gray-200"
                    >
                        <FolderPlus className="w-4 h-4" />
                        New Folder
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
                        disabled={uploadMutation.isPending}
                    >
                        {uploadMutation.isPending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Upload className="w-4 h-4" />
                        )}
                        Upload File
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">

                {/* Folders Grid (Only visible at root) */}
                {showFolders && folders && folders.length > 0 && (
                    <div className="mb-8">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Folders</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {folders.map(folder => (
                                <div
                                    key={folder.id}
                                    onClick={() => setCurrentFolder(folder)}
                                    className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <Folder className="w-8 h-8 text-blue-400 fill-blue-50 group-hover:scale-110 transition-transform" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (confirm('Delete folder?')) deleteFolderMutation.mutate(folder.id)
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="font-medium text-gray-900 truncate" title={folder.name}>{folder.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {allFiles?.filter(f => f.folderId === folder.id).length || 0} items
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files List */}
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500">
                        <div className="col-span-5">Name</div>
                        <div className="col-span-2">Department</div>
                        <div className="col-span-2">Uploaded By</div>
                        <div className="col-span-1">Size</div>
                        <div className="col-span-1">Date</div>
                        <div className="col-span-1 text-right">Actions</div>
                    </div>

                    {currentFiles.length === 0 ? (
                        <div className="py-12 text-center text-gray-400">
                            {showFolders && folders?.length === 0 ? "No resources found." : "This folder is empty."}
                        </div>
                    ) : (
                        currentFiles.map(file => (
                            <div key={file.id} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 items-center border-b border-gray-50 last:border-0 transition-colors group">
                                <div className="col-span-5 flex items-center gap-3 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 truncate" title={file.name}>{file.name}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600">
                                        {file.uploader?.employee?.department || 'N/A'}
                                    </span>
                                </div>
                                <div className="col-span-2 flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                        {file.uploader?.name?.[0] || '?'}
                                    </div>
                                    <span className="text-sm text-gray-600 truncate">{file.uploader?.name || 'Unknown'}</span>
                                </div>
                                <div className="col-span-1 text-xs text-gray-500">{file.size}</div>
                                <div className="col-span-1 text-xs text-gray-400">
                                    {format(new Date(file.createdAt), 'MMM d, yyyy')}
                                </div>
                                <div className="col-span-1 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}${file.path.startsWith('/') ? '' : '/'}${file.path}`, '_blank')}
                                        className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                                        title="Download/View"
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Delete ${file.name}?`)) deleteFileMutation.mutate(file.id)
                                        }}
                                        className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
                programId={programId}
            />
        </div>
    )
}
