import { useState } from 'react';
import { Search, Bell, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Derive user initials
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          onChange={(e) => onSearch && onSearch(e.target.value)}
          placeholder="Search files and folders..."
          className="w-full pl-10 pr-4 py-2  border  rounded-xl text-sm focus:outline-none  focus:bg-white transition
                     bg-slate-800 border-slate-700 text-black placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {/* Right User Navigation */}
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition">
          {/* <HelpCircle className="h-5 w-5" /> */}
        </button>
        <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-50 transition">
          {/* <Bell className="h-5 w-5" /> */}
        </button>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 pl-2 text-left focus:outline-none"
          >
            <div className="h-9 w-9 bg-brand-100 text-slate-300 font-semibold rounded-full flex items-center justify-center text-sm border border-brand-200">
              {initials}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-300 leading-tight">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-slate-400">Free plan</p>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <button
                onClick={logout}
                className="w-full px-3 py-2 text-left text-sm font-bold text-teal-600 hover:text-red-600 flex items-center gap-2 transition"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}