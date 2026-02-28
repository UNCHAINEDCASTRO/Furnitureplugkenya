import React, { useState, useEffect, useRef } from 'react';
import { Search, Shield, Database, Layout, ExternalLink, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Item {
  id: number;
  name: string;
  description: string;
  category: string;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelectSuggestion = (item: Item) => {
    setSelectedItem(item);
    setQuery(item.name);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Database size={18} />
            </div>
            <span className="font-semibold text-lg tracking-tight">SecureSearch</span>
          </div>
          
          <div className="relative w-full max-w-md ml-8" ref={searchRef}>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-10 py-2 bg-neutral-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl transition-all outline-none text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="animate-spin text-neutral-400" size={16} />
                </div>
              )}
            </div>

            {/* Predictive Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  <div className="p-2">
                    {suggestions.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg transition-colors flex flex-col gap-0.5"
                      >
                        <span className="font-medium text-sm text-neutral-800">{item.name}</span>
                        <span className="text-xs text-neutral-500 truncate">{item.description}</span>
                      </button>
                    ))}
                  </div>
                  <div className="bg-neutral-50 px-4 py-2 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-400">Database Results</span>
                    <Database size={12} className="text-neutral-300" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors">Documentation</button>
            <button className="bg-neutral-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors">Get Started</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h1 className="text-4xl font-bold tracking-tight text-neutral-900 mb-4">
                Secure Database Search <br />
                <span className="text-indigo-600">with Predictive Suggestions</span>
              </h1>
              <p className="text-lg text-neutral-600 max-w-2xl">
                Experience real-time search that directly queries your SQLite database. 
                Built with security-first principles to prevent data breaches and unauthorized access.
              </p>
            </section>

            {/* Search Result Display */}
            <AnimatePresence mode="wait">
              {selectedItem ? (
                <motion.div
                  key={selectedItem.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="inline-block px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded mb-2">
                        {selectedItem.category}
                      </span>
                      <h2 className="text-2xl font-bold text-neutral-900">{selectedItem.name}</h2>
                    </div>
                    <div className="p-3 bg-neutral-50 rounded-xl text-neutral-400">
                      <Layout size={24} />
                    </div>
                  </div>
                  <p className="text-neutral-600 mb-8 leading-relaxed">
                    {selectedItem.description}
                  </p>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                      View Details
                    </button>
                    <button className="px-6 py-3 border border-neutral-200 rounded-xl font-semibold hover:bg-neutral-50 transition-colors">
                      Compare
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-neutral-100 border-2 border-dashed border-neutral-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-neutral-300 mb-4 shadow-sm">
                    <Search size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">No Item Selected</h3>
                  <p className="text-neutral-500 max-w-xs">
                    Start typing in the search bar above to see predictive suggestions from the database.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar - Security Info */}
          <div className="space-y-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <h3 className="font-bold text-neutral-900">Security Hardening</h3>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="mt-1 text-emerald-500">
                    <Shield size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Server-Side Proxy</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Sensitive integrations like Google Sheets are proxied through our backend. API keys are never exposed to the browser.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-emerald-500">
                    <Shield size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Prepared Statements</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Database queries use parameterized statements to prevent SQL injection attacks.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="mt-1 text-emerald-500">
                    <Shield size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">Environment Isolation</p>
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      Secrets are managed via .env files and server-side environment variables, ensuring zero-exposure in client bundles.
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3 text-amber-700">
                <Shield size={20} />
                <h3 className="font-bold">Service Account Integration</h3>
              </div>
              <p className="text-sm text-amber-800 leading-relaxed mb-4">
                We've upgraded your security. Instead of a simple API key, we now use a <strong>Google Service Account</strong> for Sheets access.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-mono bg-white/50 p-2 rounded border border-amber-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  JWT Auth Enabled
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono bg-white/50 p-2 rounded border border-amber-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Server-Side Key Storage
                </div>
              </div>
              <p className="text-[10px] text-amber-600 mt-4 italic">
                * Your private key is never sent to the browser.
              </p>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-200">
              <h3 className="font-bold mb-2">Need help?</h3>
              <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                Our support team is available 24/7 to help you with your integration.
              </p>
              <button className="w-full bg-white text-indigo-600 py-2 rounded-lg text-sm font-bold hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                Contact Support <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center text-white">
              <Database size={14} />
            </div>
            <span className="font-bold text-neutral-900">SecureSearch</span>
          </div>
          <div className="flex gap-8 text-sm text-neutral-500">
            <a href="#" className="hover:text-neutral-900 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-neutral-900 transition-colors">Security Audit</a>
          </div>
          <p className="text-sm text-neutral-400">© 2026 SecureSearch Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
