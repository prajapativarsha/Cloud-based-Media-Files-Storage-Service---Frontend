import { NavLink } from 'react-router-dom';
import { 
  Cloud, 
  FolderClosed, 
  Users, 
  Star, 
  Clock, 
  Trash2, 
  Plus,
  HardDrive 
} from 'lucide-react';

export default function Sidebar({ onNewFolderClick }) {
  const navItems = [
    { name: 'My Files', path: '/', icon: FolderClosed },
    { name: 'Shared with me', path: '/shared', icon: Users },
    { name: 'Starred', path: '/starred', icon: Star },
    { name: 'Recent', path: '/recent', icon: Clock },
    { name: 'Trash', path: '/trash', icon: Trash2 },
  ];

  return (
    <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col h-screen shrink-0 border-r border-slate-800">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800">
        <div className="h-9 w-9 bg-brand-600 rounded-xl flex items-center justify-center text-teal-400 shadow-sm">
          <Cloud className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold text-teal-400 tracking-tight">MediaCloud</span>
      </div>

      {/* New Action Button */}
      <div className="p-4">
        <button
          onClick={onNewFolderClick}
          className="w-full py-2.5 px-4 bg-white text-slate-900 hover:bg-slate-100 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Folder</span>
        </button>
      </div>

      {/* Workspace Navigation */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Storage Indicator */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 font-medium">
            <HardDrive className="h-3.5 w-3.5" /> Storage
          </span>
          <span>0.5 GB of 10 GB</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-brand-500 rounded-full" style={{ width: '5%' }} />
        </div>
      </div>
    </aside>
  );
}