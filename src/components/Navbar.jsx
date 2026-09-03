import { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Bell, HelpCircle, LogOut, FileText, Folder, Loader2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import debounce from 'lodash.debounce';
import api from '../lib/api';
import { searchCache } from '../lib/cache';

export default function Navbar({ onSearch }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const fetchSuggestions = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const cacheKey = `search:${searchTerm.trim()}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      setSuggestions(cached);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const { data } = await api.get(`/search?q=${encodeURIComponent(searchTerm.trim())}&limit=6`);
      const results = data.results || [];
      searchCache.set(cacheKey, results);
      setSuggestions(results);
    } catch (err) {
      console.error('Failed to fetch search suggestions:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((value) => fetchSuggestions(value), 300),
    []
  );

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setShowSuggestions(true);
    debouncedSearch(val);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      if (onSearchSubmit) onSearchSubmit(query);
    }
  };

  const handleSelect = (item) => {
    setShowSuggestions(false);
    if (onSelectSearchResult) onSelectSearchResult(item);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onSearchSubmit) onSearchSubmit('');
  };

  // Derive user initials
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0].toUpperCase() || 'U';

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
      {/* Search Bar */}
      <div  ref={searchContainerRef} className="relative w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.trim() && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search files and folders..."
          className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
        />
    
      {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> : <X className="h-4 w-4" />}
          </button>
        )}

      {/* Suggestions Dropdown */}
        {showSuggestions && query.trim() && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1.5 z-50">
            {suggestions.length === 0 && !isSearching ? (
              <div className="px-4 py-3 text-xs text-slate-400 text-center">
                No matching results found for "{query}"
              </div>
            ) : (
              <div>
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Suggestions
                </div>
                {suggestions.map((item) => (
                  <div
                    key={`${item.resource_type || (item.mime_type ? 'file' : 'folder')}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3 transition"
                  >
                    {item.resource_type === 'folder' || (!item.mime_type && !item.storage_key) ? (
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <Folder className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">
                        {item.resource_type || (item.mime_type ? 'File' : 'Folder')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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