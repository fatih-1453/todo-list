"use client"

import { useState, useRef } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { CloudUpload, File, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { fileService } from "@/services/fileService"
import { CreateFolderModal } from "@/components/files/CreateFolderModal"
import { FileManager } from "@/components/files/FileManager"

export default function UploadPage() {
    const [dragActive, setDragActive] = useState(false)
    const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined)
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)

    // For Upload Simulation UI
    const [uploads, setUploads] = useState<{
        name: string;
        size: string;
        progress: number;
        status: "uploading" | "analyzing" | "done";
    }[]>([])

    const inputRef = useRef<HTMLInputElement>(null)
    const queryClient = useQueryClient()

    // Fetch folders for dropdown
    const { data: folders } = useQuery({
        queryKey: ['folders'],
        queryFn: fileService.getFolders
    })

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files)
        }
    }

    const onButtonClick = () => {
        inputRef.current?.click()
    }

    const handleFiles = (fileList: FileList) => {
        const newFiles = Array.from(fileList).map(file => ({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            type: file.type,
            progress: 0,
            status: "uploading" as const
        }))

        // Add to local state for UI feedback
        setUploads(prev => [...prev, ...newFiles])

        // Process Simulation & Backend Save
        newFiles.forEach((file, index) => {
            const globalIndex = uploads.length + index

            // 1. Upload Simulation
            let progress = 0
            const uploadInterval = setInterval(() => {
                progress += Math.random() * 25

                if (progress >= 100) {
                    clearInterval(uploadInterval)

                    // Update Local State to 'analyzing'
                    setUploads(prev => {
                        const updated = [...prev]
                        // Simple check to find by name since index might shift if multiple batches
                        const idx = updated.findIndex(u => u.name === file.name && u.status === 'uploading')
                        if (idx !== -1) {
                            updated[idx].progress = 100
                            updated[idx].status = "analyzing"
                        }
                        return updated
                    })

                    // 2. Mock AI & Save to Backend
                    setTimeout(async () => {
                        try {
                            // Create File Record in Backend
                            const formData = new FormData();
                            // 'file' here acts as the File object because we mapped the File object earlier?
                            // Wait, in handleFiles: newFiles = Array.from(fileList).map(file => ({...}))
                            // 'file' in the loop is the mapped object (name, size, type).
                            // We need the ORIGINAL File object.
                            // The original `fileList` is available in scope? No, `fileList` was passed to handleFiles.
                            // But handleFiles is called with `fileList`.
                            // So `fileList[index]` corresponds to `newFiles[index]`.
                            formData.append('file', fileList[index]);
                            if (selectedFolderId) {
                                formData.append('folderId', selectedFolderId.toString());
                            }

                            await fileService.createFileRecord(formData);

                            // Remove from "Uploads" queue (optional: or mark as done)
                            // Let's remove it to keep UI clean, as it will appear in FileManager
                            setUploads(prev => prev.filter(u => u.name !== file.name))

                            // Refresh File Manager
                            queryClient.invalidateQueries({ queryKey: ['files'] })
                            toast.success(`${file.name} uploaded successfully`)
                        } catch (error) {
                            console.error("Upload failed", error)
                            toast.error(`Failed to upload ${file.name}`)
                        }
                    }, 1000)

                } else {
                    setUploads(prev => {
                        const updated = [...prev]
                        const idx = updated.findIndex(u => u.name === file.name && u.status === 'uploading')
                        if (idx !== -1) updated[idx].progress = progress
                        return updated
                    })
                }
            }, 200)
        })
    }

    return (
        <main className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
            <Sidebar className="flex-shrink-0" />

            <div className="flex-1 flex flex-col h-full relative">
                <TopNav />

                <div className="flex-1 overflow-y-auto p-4 md:p-8 pt-2 scrollbar-none">
                    <div className="max-w-5xl mx-auto w-full">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Smart Files</h1>
                                <p className="text-gray-500">Upload documents and manage your organizational assets.</p>
                            </div>
                            <button
                                onClick={() => setIsCreateFolderOpen(true)}
                                className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                + New Folder
                            </button>
                        </div>

                        {/* Upload Area */}
                        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
                                <span className="text-sm font-semibold text-gray-600">Upload Destination:</span>
                                <select
                                    className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                                    value={selectedFolderId || ""}
                                    onChange={(e) => setSelectedFolderId(e.target.value ? Number(e.target.value) : undefined)}
                                >
                                    <option value="">Unorganized (Root)</option>
                                    {folders?.map(f => (
                                        <option key={f.id} value={f.id}>{f.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div
                                className={`
                                    p-12 text-center transition-all duration-200 cursor-pointer
                                    flex flex-col items-center justify-center gap-4
                                    ${dragActive ? "bg-blue-50" : "hover:bg-gray-50"}
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={onButtonClick}
                            >
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={handleChange}
                                />

                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                    <CloudUpload className="w-8 h-8 text-blue-500" />
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold mb-1 text-gray-900">Click to upload or drag and drop</h3>
                                    <p className="text-gray-400 text-sm">PDF, DOCX, XLSX, PPTX, Images or Video</p>
                                </div>
                            </div>

                            {/* Active Uploads Progress */}
                            {uploads.length > 0 && (
                                <div className="border-t border-gray-100 p-4 space-y-3 bg-gray-50/30">
                                    {uploads.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-sm">
                                            <File className="w-4 h-4 text-gray-400" />
                                            <span className="flex-1 truncate font-medium">{file.name}</span>
                                            {file.status === 'analyzing' ? (
                                                <span className="text-purple-600 flex items-center gap-1 text-xs">
                                                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                                                </span>
                                            ) : (
                                                <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${file.progress}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* File Manager */}
                        <FileManager />

                    </div>
                </div>
            </div>

            <CreateFolderModal
                isOpen={isCreateFolderOpen}
                onClose={() => setIsCreateFolderOpen(false)}
            />
        </main>
    )
}
