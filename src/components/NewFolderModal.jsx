import { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';

export default function NewFolderModal({ isOpen, onClose, onCreate }) {
  const [folderName, setFolderName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    setIsSubmitting(true);
    await onCreate(folderName.trim());
    setIsSubmitting(false);
    setFolderName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <FolderPlus className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">New Folder</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            required
            autoFocus
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="Folder name"
            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white mb-5 transition"
          />

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !folderName.trim()}
              className="px-4 py-2 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}