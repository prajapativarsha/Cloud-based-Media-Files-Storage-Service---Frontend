import { Clock, Star, Users, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickAccess() {
  const navigate = useNavigate();

  const cards = [
    { title: 'Recent files', desc: 'Files modified recently', icon: Clock, path: '/recent' },
    { title: 'Starred', desc: 'Important files & folders', icon: Star, path: '/starred' },
    { title: 'Shared with me', desc: 'Shared resources', icon: Users, path: '/shared' },
    { title: 'Trash', desc: 'Items retained for 30 days', icon: Trash2, path: '/trash' },
  ];

  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Quick access</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.title}
              onClick={() => navigate(c.path)}
              className="bg-teal-50 border border-slate-200 rounded-xl p-4 hover:border-teal-500 hover:shadow-sm cursor-pointer transition flex items-start gap-3.5"
            >
              <div className="p-2.5 bg-slate-50 text-slate-700 rounded-lg shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-800">{c.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{c.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}