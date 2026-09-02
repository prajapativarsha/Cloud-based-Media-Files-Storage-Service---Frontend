import { useState, useRef } from 'react';
import { UploadCloud, X, Check, AlertCircle, FileText, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function UploadModal({ isOpen, onClose, currentFolderId, onUploadSuccess }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const newItems = files.map((file) => ({
      file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      progress: 0,
      status: 'pending', // pending, uploading, complete, error
      errorMessage: ''
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
    newItems.forEach(uploadFile);
  };

  const uploadFile = async (queueItem) => {
    const formData = new FormData();
    formData.append('file', queueItem.file);
    if (currentFolderId && currentFolderId !== 'root') {
      formData.append('folderId', currentFolderId);
    }

    try {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.name === queueItem.name ? { ...item, status: 'uploading' } : item
        )
      );

      await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadQueue((prev) =>
            prev.map((item) =>
              item.name === queueItem.name ? { ...item, progress: percentCompleted } : item
            )
          );
        },
      });

      setUploadQueue((prev) =>
        prev.map((item) =>
          item.name === queueItem.name ? { ...item, status: 'complete', progress: 100 } : item
        )
      );

      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setUploadQueue((prev) =>
        prev.map((item) =>
          item.name === queueItem.name
            ? {
                ...item,
                status: 'error',
                errorMessage: err.response?.data?.error?.message || 'Upload failed'
              }
            : item
        )
      );
    }
  };

  const allFinished = uploadQueue.length > 0 && uploadQueue.every(
    (item) => item.status === 'complete' || item.status === 'error'
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Upload files</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            dragActive
              ? 'border-brand-500 bg-brand-50/50'
              : 'border-slate-200 hover:border-brand-400 bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleChange}
          />
          <div className="mx-auto w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-2">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-brand-600">Drop files here</p>
          <p className="text-xs text-slate-400 mt-0.5">or click to browse from your device</p>
          <p className="text-[11px] text-slate-400 mt-2">Maximum file size depends on your plan</p>
        </div>

        {/* Upload Queue Progress */}
        {uploadQueue.length > 0 && (
          <div className="mt-4 space-y-3 max-h-52 overflow-y-auto pr-1">
            {uploadQueue.map((item, index) => (
              <div key={index} className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2 truncate max-w-[70%]">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 truncate">{item.name}</span>
                  </div>
                  <span className="text-slate-400">{item.size}</span>
                </div>

                {/* Progress Bar & Status */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        item.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>

                  <div className="text-xs shrink-0">
                    {item.status === 'uploading' && (
                      <span className="font-medium text-brand-600">{item.progress}%</span>
                    )}
                    {item.status === 'complete' && (
                      <Check className="h-4 w-4 text-emerald-600" />
                    )}
                    {item.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-red-500" title={item.errorMessage} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={uploadQueue.length > 0 && !allFinished}
            className="px-5 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-black rounded-xl shadow-sm transition disabled:opacity-50"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}