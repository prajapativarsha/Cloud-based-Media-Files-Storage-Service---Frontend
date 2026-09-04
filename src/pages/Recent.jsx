import { useState, useEffect, useMemo } from 'react';
import { Clock, RefreshCw, FolderPlus } from 'lucide-react';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FileList from '../components/FileList';
import FilePreviewModal from '../components/FilePreviewModal';
import ShareModal from '../components/ShareModal';
import NewFolderModal from '../components/NewFolderModal';

export default function Recent() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [resourceToShare, setResourceToShare] = useState(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'updated_at', direction: 'desc' });

  const fetchRecentFiles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/files/recent?limit=50');
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to load recent files:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const handleSortChange = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'name') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      } else if (sortConfig.key === 'updated_at') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (sortConfig.key === 'size_bytes') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [files, sortConfig]);

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
                <Clock className="h-6 w-6 text-brand-600" />
                <h1 className="text-2xl font-bold text-slate-900">Recent Files</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Files you have uploaded, edited, or viewed recently.
              </p>
            </div>

            <button
              onClick={fetchRecentFiles}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm transition flex items-center gap-2 shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Listing */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Loading recent files...
            </div>
          ) : files.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 text-sm">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No recent activity</p>
              <p className="text-xs text-slate-400 mt-1">
                Files you access or upload will appear here.
              </p>
            </div>
          ) : (
            <FileList
              folders={[]}
              files={sortedFiles}
              onFolderClick={() => {}}
              onFilePreview={(file) => setPreviewFile(file)}
              onShare={(res) => setResourceToShare(res)}
              sortConfig={sortConfig}
              onSortChange={handleSortChange}
            />
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