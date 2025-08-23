'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Plus, Grid3X3, List, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCreateNew: () => void;
  totalResults: number;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreateNew,
  totalResults,
}: SearchFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search to improve performance
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      onSearchChange(query);
    }, 300); // 300ms delay
  }, [onSearchChange]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
    debouncedSearch(value);
  };

  // Sync with external search query changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="mb-8 space-y-6">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Create New Prompt
        </button>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-white/80 text-sm mr-2">View:</span>
          <div className="flex bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-full transition-all duration-300 ${
                viewMode === 'grid'
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-full transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white/20 text-white shadow-md'
                  : 'text-white/60 hover:text-white/80 hover:bg-white/10'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Search Container */}
      <div className="flex justify-center">
        <div className="relative max-w-2xl w-full">
          <div className="search-icon absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="Search prompts by title, tag, or description..."
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-4 text-white placeholder-white/60 bg-white/10 border-white/20 rounded-full backdrop-blur-sm focus:bg-white/20 focus:border-white/30 transition-all duration-300 text-lg"
          />
          {localSearchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      <div className="text-center">
        <div className="text-white/80 text-lg">
          {localSearchQuery ? (
            <>
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{localSearchQuery}"
            </>
          ) : (
            <>
              Showing {totalResults} prompt{totalResults !== 1 ? 's' : ''}
            </>
          )}
        </div>
      </div>
    </div>
  );
}