import { useState, useEffect } from 'react';
import { Trash2, RotateCcw, AlertTriangle, Folder, FileText } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../lib/api';

export default function Trash() {
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [deletedFolders, setDeletedFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/trash');
      setDeletedFolders(data.trash?.folders || []);
      setDeletedFiles(data.trash?.files || []);
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (type, id) => {
    try {
      await api.post('/trash/restore', { resourceType: type, resourceId: id });
      fetchTrash();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Restore failed');
    }
  };

  const handlePurge = async (type, id) => {
    if (!confirm('Permanently delete this item? This cannot be undone.')) return;
    try {
      await api.delete('/trash/purge', { data: { resourceType: type, resourceId: id } });
      fetchTrash();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Purge failed');
    }
  };

  const totalItems = deletedFolders.length + deletedFiles.length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar onNewFolderClick={() => {}} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Trash</h1>
            <p className="text-xs text-slate-500 mt-0.5">Items here can be restored or permanently purged.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3 mb-6 text-xs text-amber-800">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span>Items in the trash will be automatically purged after 30 days.</span>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="py-20 text-center text-slate-400 text-sm">Loading trash...</div>
            ) : totalItems === 0 ? (
              <div className="py-20 text-center text-slate-400 text-sm flex flex-col items-center">
                <Trash2 className="h-10 w-10 text-slate-300 mb-2" />
                <span>Trash is empty</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 text-xs font-semibold uppercase bg-slate-50/50">
                    <th className="py-3 px-6">Name</th>
                    <th className="py-3 px-6">Deleted date</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Folders */}
                  {deletedFolders.map((folder) => (
                    <tr key={folder.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-medium text-slate-800 flex items-center gap-3">
                        <Folder className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span>{folder.name}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">{new Date(folder.updated_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleRestore('folder', folder.id)}
                          className="px-2.5 py-1 text-brand-600 hover:bg-brand-50 rounded-lg text-xs font-medium"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePurge('folder', folder.id)}
                          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
                        >
                          Delete permanently
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Files */}
                  {deletedFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-6 font-medium text-slate-800 flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span>{file.name}</span>
                      </td>
                      <td className="py-3.5 px-6 text-slate-500 text-xs">{new Date(file.updated_at).toLocaleDateString()}</td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleRestore('file', file.id)}
                          className="px-2.5 py-1 text-brand-600 hover:bg-brand-50 rounded-lg text-xs font-medium"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handlePurge('file', file.id)}
                          className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded-lg text-xs font-medium"
                        >
                          Delete permanently
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}