import { useState, useEffect } from 'react';
import { X, History, RotateCcw, Upload, Clock, FileCheck } from 'lucide-react';
import api from '../lib/api';

export default function VersionModal({ isOpen, onClose, file, onVersionReverted }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      fetchVersions();
    }
  }, [isOpen, file]);

  const fetchVersions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/files/${file.id}/versions`);
      setVersions(data.versions || []);
    } catch (err) {
      console.error('Failed to load versions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (versionId) => {
    if (!confirm('Revert to this version?')) return;
    try {
      await api.post(`/files/${file.id}/revert`, { versionId });
      fetchVersions();
      if (onVersionReverted) onVersionReverted();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to revert version');
    }
  };

  const handleNewVersionUpload = async (e) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    const formData = new FormData();
    formData.append('file', newFile);

    setUploading(true);
    try {
      await api.post(`/files/${file.id}/version`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchVersions();
      if (onVersionReverted) onVersionReverted();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-brand-600" />
            <h3 className="text-base font-bold text-slate-900 truncate">Version History</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-4 truncate">{file.name}</p>

        {/* Upload New Version Button */}
        <label className="mb-5 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-brand-50 hover:border-brand-300 cursor-pointer transition">
          <Upload className="h-4 w-4 text-slate-500" />
          <span>{uploading ? 'Uploading version...' : 'Upload new version'}</span>
          <input type="file" className="hidden" disabled={uploading} onChange={handleNewVersionUpload} />
        </label>

        {/* Versions List */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {/* Current Active Version */}
          <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileCheck className="h-4 w-4 text-brand-600" />
              <div>
                <p className="text-xs font-bold text-brand-900">Current Version</p>
                <p className="text-[11px] text-brand-700">{(file.size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-200 text-brand-800 px-2 py-0.5 rounded-full">Active</span>
          </div>

          {loading ? (
            <p className="text-center py-4 text-xs text-slate-400">Loading versions...</p>
          ) : versions.length === 0 ? (
            <p className="text-center py-4 text-xs text-slate-400">No previous versions available.</p>
          ) : (
            versions.map((ver) => (
              <div key={ver.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Version {ver.version_number}</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {new Date(ver.created_at).toLocaleString()} • {(ver.size_bytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => handleRevert(ver.id)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg transition flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" /> Revert
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}