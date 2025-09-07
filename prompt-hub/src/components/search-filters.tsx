'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Plus, Grid3X3, List, Filter, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onCreateNew: () => void;
  totalResults: number;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export function SearchFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onCreateNew,
  totalResults,
  sortBy,
  onSortChange,
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
    <div className="mb-8 space-y-6" data-testid="search-filters">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        {/* Create New Button */}
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm rounded-full font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          data-testid="create-prompt-button"
        >
          <Plus className="h-4 w-4" />
          Create New Prompt
        </button>

        {/* Controls - Sort and View Mode */}
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm mr-2">Sort:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-300" data-testid="sort-select">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-white/20">
                <SelectItem value="recent" className="text-gray-800 hover:bg-white/10 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Recent
                  </div>
                </SelectItem>
                <SelectItem value="likes" className="text-gray-800 hover:bg-white/10 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">❤️</span>
                    Likes
                  </div>
                </SelectItem>
                <SelectItem value="alphabetical" className="text-gray-800 hover:bg-white/10 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500">🔤</span>
                    A-Z
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                data-testid="view-toggle-grid"
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
                data-testid="view-toggle-list"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Container */}
      <div className="flex justify-center">
        <div className="relative max-w-3xl w-full">
          <div className="search-icon absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60">
            <Search className="h-5 w-5" />
          </div>
          <Input
            type="text"
            placeholder="Search prompts by title, tag, or description..."
            value={localSearchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-12 pr-6 py-5 text-white placeholder-white/60 bg-white/10 border-white/20 rounded-full backdrop-blur-sm focus:bg-white/20 focus:border-white/30 transition-all duration-300 text-lg"
            data-testid="search-input"
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
        <div className="text-white/80 text-lg" data-testid="total-results">
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