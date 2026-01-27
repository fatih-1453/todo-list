"use client"

import * as React from "react"
import {
    Folder,
    FileText,
    ChevronRight,
    ChevronDown,
    Download,
    MoreVertical,
    Trash2,
    HardDrive
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fileService, Folder as FolderType, FileRecord } from "@/services/fileService"
import { cn } from "@/lib/utils"

export function FileManager() {
    const queryClient = useQueryClient()
    const { data: folders } = useQuery({
        queryKey: ['folders'],
        queryFn: () => fileService.getFolders()
    })

    const { data: allFiles } = useQuery({
        queryKey: ['files'],
        queryFn: () => fileService.getFiles() // Fetch all files
    })

    // Group files by folderId
    const filesByFolder = React.useMemo(() => {
        const grouped: Record<number | string, FileRecord[]> = { "unorganized": [] }
        allFiles?.forEach(file => {
            if (file.folderId) {
                if (!grouped[file.folderId]) grouped[file.folderId] = []
                grouped[file.folderId].push(file)
            } else {
                grouped["unorganized"].push(file)
            }
        })
        return grouped
    }, [allFiles])

    const deleteFolderMutation = useMutation({
        mutationFn: fileService.deleteFolder,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['folders'] })
    })

    const deleteFileMutation = useMutation({
        mutationFn: fileService.deleteFile,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['files'] })
    })

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    Storage
                </h3>
            </div>
            <div className="p-2 space-y-1">
                {/* Folders List */}
                {folders?.map(folder => (
                    <FolderItem
                        key={folder.id}
                        folder={folder}
                        files={filesByFolder[folder.id] || []}
                        onDelete={() => {
                            if (confirm('Delete folder and all its files?')) {
                                deleteFolderMutation.mutate(folder.id)
                            }
                        }}
                        onDeleteFile={(id) => deleteFileMutation.mutate(id)}
                    />
                ))}

                {/* Unorganized Files */}
                {filesByFolder["unorganized"].length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Unorganized Files
                        </div>
                        <div className="space-y-1">
                            {filesByFolder["unorganized"].map(file => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    onDelete={() => deleteFileMutation.mutate(file.id)}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {(!folders || folders.length === 0) && filesByFolder["unorganized"].length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Folder className="w-12 h-12 mb-2 stroke-1" />
                        <p>No files or folders yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function FolderItem({ folder, files, onDelete, onDeleteFile }: {
    folder: FolderType,
    files: FileRecord[],
    onDelete: () => void,
    onDeleteFile: (id: number) => void
}) {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <div className="rounded-xl overflow-hidden transition-all duration-200">
            {/* Folder Header */}
            <div
                className={cn(
                    "flex items-center group px-3 py-2 cursor-pointer hover:bg-gray-100/80 transition-colors",
                    isOpen ? "bg-gray-50" : ""
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center justify-center w-6 h-6 mr-2 text-gray-400 transition-transform duration-200">
                    {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>

                <Folder className={cn("w-5 h-5 mr-3 transition-colors", isOpen ? "text-blue-500 fill-blue-50" : "text-gray-400")} />

                <span className="font-medium text-gray-700 text-sm flex-1">{folder.name}</span>

                <span className="text-xs text-gray-400 mr-4">{files.length} items</span>

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete()
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all"
                    title="Delete Folder"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Folder Contents (Files) */}
            {isOpen && (
                <div className="ml-[2.75rem] border-l border-gray-100 pl-2 py-1 space-y-0.5 animate-in slide-in-from-top-2 duration-200">
                    {files.length === 0 ? (
                        <div className="py-2 px-3 text-xs text-gray-400 italic">Empty folder</div>
                    ) : (
                        files.map(file => (
                            <FileItem key={file.id} file={file} onDelete={() => onDeleteFile(file.id)} />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

function FileItem({ file, onDelete }: { file: FileRecord, onDelete: () => void }) {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation()
        // Use relative path for proxy
        const apiUrl = "";
        // Remove duplicate slashes if any
        const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
        window.open(`${apiUrl}${path}`, '_blank');
    }

    return (
        <div className="flex items-center justify-between group px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-default">
            <div className="flex items-center min-w-0 flex-1">
                <FileText className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-sm text-gray-600 truncate">{file.name}</span>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-gray-300">{file.size}</span>

                <button
                    onClick={handleDownload}
                    className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
                    title="Download"
                >
                    <Download className="w-3.5 h-3.5" />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete file?')) onDelete();
                    }}
                    className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-md transition-colors"
                    title="Delete"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    )
}
