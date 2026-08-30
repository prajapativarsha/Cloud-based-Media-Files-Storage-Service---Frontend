import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumbs({ breadcrumbs, onNavigate }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 mb-6">
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;
        return (
          <div key={crumb.id} className="flex items-center gap-1">
            {index === 0 ? (
              <button
                onClick={() => onNavigate(crumb.id)}
                className="flex items-center gap-1 font-medium hover:text-brand-600 transition"
              >
                <Home className="h-4 w-4" />
                <span>{crumb.name}</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate(crumb.id)}
                disabled={isLast}
                className={`font-medium transition ${
                  isLast ? 'text-teal-800 cursor-default' : 'hover:text-brand-600'
                }`}
              >
                {crumb.name}
              </button>
            )}
            {!isLast && <ChevronRight className="h-4 w-4 text-slate-400" />}
          </div>
        );
      })}
    </nav>
  );
}