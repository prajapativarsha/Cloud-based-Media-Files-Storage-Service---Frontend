import { useState, useEffect } from 'react';
import { X, Users, Link as LinkIcon, Copy, Trash2, Check, Globe } from 'lucide-react';
import api from '../lib/api';

export default function ShareModal({ isOpen, onClose, resource }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [collaborators, setCollaborators] = useState([]);
  const [publicLink, setPublicLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && resource) {
      fetchShares();
    }
  }, [isOpen, resource]);

  const fetchShares = async () => {
    try {
      const { data } = await api.get(`/shares/${resource.type}/${resource.id}`);
      setCollaborators(data.shares || []);
    } catch (err) {
      console.error('Failed to fetch shares:', err);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await api.post('/shares', {
        resourceType: resource.type,
        resourceId: resource.id,
        email,
        role,
      });
      setEmail('');
      fetchShares();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to share');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await api.delete(`/shares/${shareId}`);
      fetchShares();
    } catch (err) {
      console.error('Failed to revoke access:', err);
    }
  };

  const generatePublicLink = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/link-shares', {
        resourceType: resource.type,
        resourceId: resource.id,
      });
      setPublicLink(data.link.shareUrl);
    } catch (err) {
      alert('Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (publicLink) {
      navigator.clipboard.writeText(publicLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">Share "{resource.name}"</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Add Collaborator Form */}
        <form onSubmit={handleShare} className="flex gap-2 mb-6">
          <input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <button
            type="submit"
            disabled={loading || !email}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-black text-sm font-medium rounded-xl transition disabled:opacity-50"
          >
            Share
          </button>
        </form>

        {/* Collaborators List */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">People with access</h4>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
            {collaborators.length === 0 ? (
              <p className="text-sm text-slate-400">Not shared with anyone yet.</p>
            ) : (
              collaborators.map((share) => (
                <div key={share.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-brand-100 text-brand-700 rounded-full flex items-center justify-center font-bold text-xs">
                      {share.grantee?.display_name?.[0] || share.grantee?.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{share.grantee?.display_name || 'User'}</p>
                      <p className="text-xs text-slate-500">{share.grantee?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 capitalize">{share.role}</span>
                    <button
                      onClick={() => handleRevoke(share.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                      title="Remove access"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* General Access / Public Link */}
        <div>
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">General access</h4>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-2 bg-slate-200 rounded-full shrink-0">
                <Globe className="h-4 w-4 text-slate-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-slate-800">Public Link</p>
                <p className="text-xs text-slate-500 truncate">
                  {publicLink || 'Anyone with the link can view'}
                </p>
              </div>
            </div>
            
            {!publicLink ? (
              <button
                onClick={generatePublicLink}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition shrink-0"
              >
                Create Link
              </button>
            ) : (
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-lg hover:bg-brand-100 transition shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy link'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}