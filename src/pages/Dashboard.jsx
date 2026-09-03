import { useState, useEffect } from 'react';
import api from '../lib/api';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Breadcrumbs from '../components/Breadcrumbs';
import QuickAccess from '../components/QuickAccess';
import FileList from '../components/FileList';
import NewFolderModal from '../components/NewFolderModal';
import UploadModal from '../components/UploadModal';
import FilePreviewModal from '../components/FilePreviewModal';
import ShareModal from '../components/ShareModal';
import { FolderPlus, UploadCloud } from 'lucide-react';

export default function Dashboard() {
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'My Files' }]);
  const [loading, setLoading] = useState(true);

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [resourceToShare, setResourceToShare] = useState(null);

  const fetchFolderContent = async (folderId) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/folders/${folderId}`);
      setFolders(data.children?.folders || []);
      setFiles(data.children?.files || []);
      setBreadcrumbs(data.breadcrumbs || [{ id: 'root', name: 'My Files' }]);
      setCurrentFolderId(folderId);
    } catch (err) {
      console.error('Failed to load folder data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderContent(currentFolderId);
  }, []);

  const handleCreateFolder = async (name) => {
    try {
      await api.post('/folders', {
        name,
        parentId: currentFolderId === 'root' ? null : currentFolderId,
      });
      fetchFolderContent(currentFolderId);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create folder');
    }
  };

  const handleShareClick = (resource) => {
    setResourceToShare(resource);
    setIsShareModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
      <Sidebar onNewFolderClick={() => setIsNewFolderOpen(true)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto p-8">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-100">My Files</h1>
              <p className="text-xs text-slate-400 mt-0.5">Manage and organize your cloud files.</p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 hover:text-teal-300 text-slate-300 font-medium rounded-xl text-sm shadow-sm transition flex items-center gap-2
                 border border-slate-700  "
              >
                <UploadCloud className="h-4 w-4" />
                <span>Upload files</span>
              </button>
              <button
                onClick={() => setIsNewFolderOpen(true)}
                className="px-4 py-2 border  hover:text-teal-300  bg-teal-600 hover:bg-slate-700 text-white border-transparent  font-medium rounded-xl text-sm transition flex items-center gap-2 shadow-xs"
              >
                <FolderPlus className="h-4 w-4" />
                <span>New folder</span>
              </button>
            </div>
          </div>

          <Breadcrumbs breadcrumbs={breadcrumbs} onNavigate={fetchFolderContent} />
          
          {currentFolderId === 'root' && <QuickAccess />}

          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading folder contents...</div>
          ) : (
            <FileList
              folders={folders}
              files={files}
              onFolderClick={fetchFolderContent}
              onFilePreview={(file) => setPreviewFile(file)}
              onShare={handleShareClick}
            />
          )}
        </main>
      </div>

      <NewFolderModal
        isOpen={isNewFolderOpen}
        onClose={() => setIsNewFolderOpen(false)}
        onCreate={handleCreateFolder}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        currentFolderId={currentFolderId}
        onUploadSuccess={() => fetchFolderContent(currentFolderId)}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />

      <ShareModal
      isOpen={isShareModalOpen}
      onClose={() => {
        setIsShareModalOpen(false);
        setResourceToShare(null);
      }}
      resource={resourceToShare}
    />

    </div>
  );
}