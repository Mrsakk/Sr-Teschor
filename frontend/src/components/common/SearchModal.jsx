import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Compass, Building2, MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { searchApi } from '../../api/endpoints';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ destinations: [], businesses: [], categories: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      fetchSuggestions('');
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Keyboard shortcut listener (Cmd+K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const fetchSuggestions = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await searchApi.getSuggestions(searchTerm);
      setResults(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    fetchSuggestions(val);
  };

  const handleSelect = (url) => {
    onClose();
    navigate(url);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onClose();
    navigate(`/destinations?search=${encodeURIComponent(query.trim())}`);
  };

  if (!isOpen) return null;

  const totalResults = results.destinations.length + results.businesses.length + results.categories.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center p-4 sm:p-6 sm:pt-20">
      <div className="bg-white rounded-xl shadow-md border border-slate-100 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Input Box */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-slate-100 px-5 py-4">
          <Search className="w-5 h-5 text-orange-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search Angkor Wat, Bayon, Haven, Cafés, Boutique Hotels..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base sm:text-lg font-medium focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); fetchSuggestions(''); }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            ESC
          </button>
        </form>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          
          {loading && (
            <div className="text-center py-8 text-xs text-slate-400">
              Searching destinations & businesses in Siem Reap...
            </div>
          )}

          {!loading && totalResults === 0 && query && (
            <div className="text-center py-10">
              <Compass className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No matching destinations found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for "Angkor", "Café", "Villa", or "Temple"</p>
            </div>
          )}

          {/* Categories Quick Links */}
          {results.categories.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                Categories
              </p>
              <div className="space-y-1">
                {results.categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleSelect(cat.url)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50/80 group text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-sm text-slate-800 group-hover:text-orange-600">
                        {cat.title}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tourist Destinations */}
          {results.destinations.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                Tourist Destinations
              </p>
              <div className="space-y-1">
                {results.destinations.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.url)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Compass className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 group-hover:text-orange-600 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500">{item.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Local Businesses */}
          {results.businesses.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1.5">
                Hotels, Dining & Services
              </p>
              <div className="space-y-1">
                {results.businesses.map((biz) => (
                  <button
                    key={biz.id}
                    onClick={() => handleSelect(biz.url)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 group text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {biz.title}
                        </p>
                        <p className="text-xs text-slate-500">{biz.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      View
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info in Modal */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Press <strong>Enter</strong> for all matching destinations</span>
          <button
            onClick={() => handleSearchSubmit({ preventDefault: () => {} })}
            className="text-orange-600 font-bold hover:underline"
          >
            Explore All Results →
          </button>
        </div>
      </div>
    </div>
  );
}
