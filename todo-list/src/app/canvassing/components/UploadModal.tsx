import React, { useRef, useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    endpoint: string;
    title?: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, endpoint, title = 'Upload Data' }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setStatus('idle');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setStatus('idle');

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            await apiClient.post(endpoint, formData);
            setStatus('success');
            setTimeout(() => {
                onClose();
                setSelectedFile(null);
                setStatus('idle');
            }, 1500);
        } catch (error) {
            console.error('Upload failed:', error);
            setStatus('error');
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animated-fade-in-up">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center justify-center text-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                    />

                    {!selectedFile ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload size={32} />
                            </div>
                            <span className="text-gray-600 font-medium group-hover:text-blue-600">Click to upload file</span>
                            <span className="text-gray-400 text-xs mt-1">.CSV, .XLSX supported</span>
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="flex items-center p-4 bg-gray-50 rounded-xl mb-6">
                                <div className="p-3 bg-white rounded-lg shadow-sm mr-4">
                                    <FileText className="text-blue-600" size={24} />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="p-2 hover:bg-gray-200 rounded-full"
                                >
                                    <X size={16} className="text-gray-500" />
                                </button>
                            </div>

                            {status === 'success' && (
                                <div className="mb-4 flex items-center justify-center text-green-600 gap-2 font-medium">
                                    <CheckCircle size={20} /> Upload Successful!
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="mb-4 flex items-center justify-center text-red-600 gap-2 font-medium">
                                    <AlertCircle size={20} /> Upload Failed. Try again.
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={uploading || status === 'success'}
                                className={`w-full py-3 rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2
                                    ${uploading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'}
                                `}
                            >
                                {uploading ? 'Uploading...' : 'Confirm Upload'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
