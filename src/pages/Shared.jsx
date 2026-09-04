import { useState, useEffect, useMemo } from 'react';
import { Users, RefreshCw, Eye, MoreVertical, Folder, FileText, Image, Video, Music, File } from 'lucide-react';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FilePreviewModal from '../components/FilePreviewModal';
import ShareModal from '../components/ShareModal';
import NewFolderModal from '../components/NewFolderModal';

export default function Shared() {
  const [sharedFiles, setSharedFiles] = useState([]);
  const [sharedFolders, setSharedFolders] = useState([]);
  const [sharesMeta, setSharesMeta] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Sort state
  const [previewFile, setPreviewFile] = useState(null);
  const [resourceToShare, setResourceToShare] = useState(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fetchSharedItems = async () => {
    setLoading(true);
    try {
        
      const { data } = await api.get('/shares/shared-with-me');
      setSharedFiles(data.sharedFiles || []);
      setSharedFolders(data.sharedFolders || []);
      setSharesMeta(data.shares || []);
    } catch (err) {
      console.error('Failed to load shared items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedItems();
  }, []);

  const getRoleForResource = (type, id) => {
    const match = sharesMeta.find(
      (s) => s.resource_type === type && s.resource_id === id
    );
    return match?.role || 'viewer';
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '--';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (isoString) => {
    if (!isoString) return '--';
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image className="h-4 w-4 text-emerald-500" />;
    if (mimeType?.startsWith('video/')) return <Video className="h-4 w-4 text-purple-500" />;
    if (mimeType?.startsWith('audio/')) return <Music className="h-4 w-4 text-amber-500" />;
    if (mimeType?.includes('pdf') || mimeType?.includes('text')) return <FileText className="h-4 w-4 text-blue-500" />;
    return <File className="h-4 w-4 text-slate-400" />;
  };

  const hasItems = sharedFolders.length > 0 || sharedFiles.length > 0;
  
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar onNewFolderClick={() => setIsNewFolderOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-brand-600" />
                <h1 className="text-2xl font-bold text-slate-900">Shared with me</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Files and folders that other teammates have given you access to view or edit.
              </p>
            </div>

            <button
              onClick={fetchSharedItems}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm transition flex items-center gap-2 shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Listing */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Loading shared resources...
            </div>
          ) : !hasItems ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 text-sm shadow-sm">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No shared items yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Files and folders shared with your email address will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-800 text-sm">Shared Items</h3>
              </div>

              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase bg-slate-50/50">
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Access Role</th>
                    <th className="py-3 px-6">Last modified</th>
                    <th className="py-3 px-6">Size</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Folders */}
                  {sharedFolders.map((folder) => {
                    const role = getRoleForResource('folder', folder.id);
                    return (
                      <tr key={folder.id} className="hover:bg-slate-50 transition group">
                        <td className="py-3.5 px-6 font-medium text-slate-800 flex items-center gap-3">
                          <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                            <Folder className="h-4 w-4 fill-amber-500 text-amber-500" />
                          </div>
                          <span>{folder.name}</span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              role === 'editor'
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {role}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500">{formatDate(folder.updated_at)}</td>
                        <td className="py-3.5 px-6 text-slate-400">--</td>
                        <td className="py-3.5 px-6 text-right">
                          <span className="text-xs text-slate-400 italic">Folder view</span>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Files */}
                  {sharedFiles.map((file) => {
                    const role = getRoleForResource('file', file.id);
                    return (
                      <tr
                        key={file.id}
                        onDoubleClick={() => setPreviewFile(file)}
                        className="hover:bg-slate-50 transition group cursor-pointer"
                      >
                        <td className="py-3.5 px-6 font-medium text-slate-800 flex items-center gap-3">
                          <div className="p-1.5 bg-slate-50 rounded-lg">
                            {getFileIcon(file.mime_type)}
                          </div>
                          <span className="truncate max-w-xs">{file.name}</span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              role === 'editor'
                                ? 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {role}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-slate-500">{formatDate(file.updated_at)}</td>
                        <td className="py-3.5 px-6 text-slate-500">{formatBytes(file.size_bytes)}</td>
                        <td className="py-3.5 px-6 text-right flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile(file);
                            }}
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium flex items-center gap-1 transition"
                          >
                            <Eye className="h-3.5 w-3.5" /> Preview
                          </button>
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded transition">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <ShareModal
        isOpen={!!resourceToShare}
        onClose={() => setResourceToShare(null)}
        resource={resourceToShare}
      />

      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={async (name) => {
          await api.post('/folders', { name, parentId: null });
        }}
      />
    </div>
  );
}