import { useState, useEffect } from 'react';
import { X, Download, AlertCircle, FileText } from 'lucide-react';
import api from '../lib/api';

export default function FilePreviewModal({ file, onClose }) {
  const [signedUrl, setSignedUrl] = useState('');
  const [textContent, setTextContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) return;

    const loadPreview = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/files/${file.id}`);
        setSignedUrl(data.signedUrl);

        // Fetch text content for text preview files
        if (file.mime_type?.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
          const res = await fetch(data.signedUrl);
          const text = await res.text();
          setTextContent(text);
        }
      } catch (err) {
        setError('Failed to load file preview');
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [file]);

  if (!file) return null;

  const isImage = file.mime_type?.startsWith('image/');
  const isPdf = file.mime_type?.includes('pdf') || file.name.endsWith('.pdf');
  const isText = file.mime_type?.includes('text') || file.name.endsWith('.txt') || file.name.endsWith('.md');

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full h-[80vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3 truncate">
            <FileText className="h-5 w-5 text-brand-600 shrink-0" />
            <span className="font-semibold text-slate-800 truncate">{file.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {signedUrl && (
              <a
                href={signedUrl}
                download={file.name}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 bg-slate-50 p-6 flex items-center justify-center overflow-auto">
          {loading ? (
            <div className="text-sm text-slate-400">Loading preview...</div>
          ) : error ? (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          ) : isImage ? (
            <img src={signedUrl} alt={file.name} className="max-h-full max-w-full object-contain rounded-lg shadow-sm" />
          ) : isPdf ? (
            <iframe src={signedUrl} title={file.name} className="w-full h-full rounded-lg border border-slate-200 bg-white" />
          ) : isText ? (
            <pre className="w-full h-full bg-white p-4 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 overflow-auto whitespace-pre-wrap">
              {textContent}
            </pre>
          ) : (
            <div className="text-center">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-600 font-medium">No inline preview available for this file type</p>
              <a
                href={signedUrl}
                download={file.name}
                className="mt-3 inline-block px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition"
              >
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}