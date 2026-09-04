import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import FileList from '../components/FileList';
import FilePreviewModal from '../components/FilePreviewModal';
import ShareModal from '../components/ShareModal';
import NewFolderModal from '../components/NewFolderModal';

export default function Starred() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Sort state
  const [previewFile, setPreviewFile] = useState(null);
  const [resourceToShare, setResourceToShare] = useState(null);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const fetchStarredItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/stars');
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (err) {
      console.error('Failed to load starred items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStarredItems();
  }, []);

  const handleSortChange = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = useMemo(() => {
    const sorter = (a, b) => {
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
    };

    return {
      folders: [...folders].sort(sorter),
      files: [...files].sort(sorter),
    };
  }, [folders, files, sortConfig]);

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
                <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                <h1 className="text-2xl font-bold text-slate-900">Starred</h1>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Quickly access the files and folders you’ve flagged as important.
              </p>
            </div>

            <button
              onClick={fetchStarredItems}
              className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-xl text-sm transition flex items-center gap-2 shadow-xs"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Content Listing */}
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">
              Loading starred items...
            </div>
          ) : folders.length === 0 && files.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-400 text-sm shadow-sm">
              <Star className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="font-medium text-slate-600">No starred items</p>
              <p className="text-xs text-slate-400 mt-1">
                Star files or folders to find them easily here.
              </p>
            </div>
          ) : (
            <FileList
              folders={sortedData.folders}
              files={sortedData.files}
              onFolderClick={(folderId) => navigate(`/?folderId=${folderId}`)}
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