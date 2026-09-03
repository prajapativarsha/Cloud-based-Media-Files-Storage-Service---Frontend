import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CloudUpload, Download, Lock, FileText, AlertCircle, Folder } from 'lucide-react';
import api from '../lib/api';

export default function PublicShare() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [password, setPassword] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSharedResource = async (pwd = '') => {
    setLoading(true);
    setError('');
    try {
      const url = pwd 
        ? `/link-shares/${token}?password=${encodeURIComponent(pwd)}` 
        : `/link-shares/${token}`;
      const res = await api.get(url);
      setData(res.data);
      setRequiresPassword(false);
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.error?.code === 'PASSWORD_REQUIRED') {
        setRequiresPassword(true);
      } else if (err.response?.status === 403) {
        setError('Incorrect password');
      } else if (err.response?.status === 410) {
        setError('This share link has expired');
      } else {
        setError('Resource not found or link is invalid');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedResource();
  }, [token]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    fetchSharedResource(password);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-sm">
          <CloudUpload className="h-6 w-6 text-teal-700"/>
        </div>
        <span className="text-2xl font-bold text-teal-700 tracking-tight">MediaCloud</span>
      </div>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Loading shared item...</div>
        ) : requiresPassword ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="flex items-center gap-3 text-amber-600 mb-2">
              <Lock className="h-5 w-5" />
              <h2 className="text-base font-bold text-slate-900">Password Protected</h2>
            </div>
            <p className="text-xs text-slate-500">This link requires a password to access.</p>

            {error && (
              <div className="p-2.5 bg-red-50 text-red-600 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <input
              type="password"
              required
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
            />
            <button
              type="submit"
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl text-sm transition"
            >
              Unlock Link
            </button>
          </form>
        ) : error ? (
          <div className="text-center py-6">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">Access Restricted</h3>
            <p className="text-xs text-slate-500 mt-1">{error}</p>
          </div>
        ) : data?.resourceType === 'file' ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 truncate mb-1">{data.file.name}</h2>
            <p className="text-xs text-slate-400 mb-6">
              {(data.file.size_bytes / (1024 * 1024)).toFixed(1)} MB
            </p>
            <a
              href={data.downloadUrl}
              download={data.file.name}
              className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download File</span>
            </a>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Folder className="h-6 w-6 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 truncate">{data?.folder?.name}</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {data?.files?.map((f) => (
                <div key={f.id} className="py-2.5 flex items-center justify-between text-xs">
                  <span className="text-slate-800 truncate">{f.name}</span>
                  <span className="text-slate-400 shrink-0">{(f.size_bytes / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}