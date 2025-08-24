'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { CommandPalette } from '@/components/command-palette';
import { SearchFilters } from '@/components/search-filters';
import { PromptCard } from '@/components/prompt-card';
import { PromptModal } from '@/components/prompt-modal';
import { CreatePromptModal } from '@/components/create-prompt-modal';
import { ClientOnly } from '@/components/client-only';
import { searchPrompts, indexPrompts } from '@/lib/search';
import type { PromptCatalogEntry } from '@/types/prompt';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [catalog, setCatalog] = useState<PromptCatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<PromptCatalogEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Prompt copied to clipboard!');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // URL-synced state
  const searchQuery = searchParams.get('q') || '';

  const filteredPrompts = useMemo(() => {
    if (!catalog || catalog.length === 0) {
      return [];
    }

    // Filter out invalid prompts first
    const validPrompts = catalog.filter(prompt => 
      prompt && 
      prompt.slug && 
      prompt.title && 
      prompt.excerpt && 
      Array.isArray(prompt.tags)
    );

    // Use FlexSearch for fast searching
    if (searchQuery) {
      return searchPrompts(searchQuery, validPrompts);
    }

    return validPrompts;
  }, [catalog, searchQuery]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setIsLoading(true);
        // Try dynamic API first
        const response = await fetch('/api/prompts');
        if (!response.ok) {
          throw new Error(`API failed: ${response.status}`);
        }
        const data = await response.json();
        
        // Validate and sanitize the catalog data
        const validatedData = Array.isArray(data) ? data.filter(item => 
          item && 
          typeof item === 'object' && 
          item.slug && 
          item.title && 
          Array.isArray(item.tags) && 
          item.excerpt
        ) : [];
        
        setCatalog(validatedData);
        // Index prompts for fast search
        if (validatedData.length > 0) {
          indexPrompts(validatedData);
        }
      } catch (error) {
        console.error('Dynamic API failed, falling back to static catalog:', error);
        
        // Fallback to static catalog
        try {
          const fallbackResponse = await fetch('/data/catalog.json');
          const fallbackData = await fallbackResponse.json();
          
          const validatedFallbackData = Array.isArray(fallbackData) ? fallbackData.filter(item => 
            item && 
            typeof item === 'object' && 
            item.slug && 
            item.title && 
            Array.isArray(item.tags) && 
            item.excerpt
          ) : [];
          
          setCatalog(validatedFallbackData);
          if (validatedFallbackData.length > 0) {
            indexPrompts(validatedFallbackData);
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          setCatalog([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalog();
  }, []);

  // Auto-refresh catalog every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      loadCatalog();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Function to manually refresh catalog
  const refreshCatalog = async () => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    await loadCatalog();
    setIsRefreshing(false);
  };

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    router.push(`/?${newParams.toString()}`);
  };

  const openModal = (prompt: PromptCatalogEntry) => {
    setSelectedPrompt(prompt);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPrompt(null);
  };

  const showCopyToast = (message?: string) => {
    if (message) {
      setToastMessage(message);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCreatePrompt = async (promptData: {
    title: string;
    content: string;
    tags: string[];
    collection?: string;
  }) => {
    try {
      const response = await fetch('/api/prompts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(promptData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create prompt');
      }

      const newPrompt = await response.json();
      setCatalog(prev => [newPrompt, ...prev]);
      showCopyToast();
    } catch (error) {
      console.error('Failed to create prompt:', error);
      throw error;
    }
  };

  const handleEditPrompt = async (updatedPrompt: PromptCatalogEntry) => {
    try {
      const response = await fetch(`/api/prompts/${updatedPrompt.slug}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: updatedPrompt.tags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prompt');
      }

      const updated = await response.json();
      setCatalog(prev => 
        prev.map(prompt => 
          prompt.slug === updated.slug ? updated : prompt
        )
      );
    } catch (error) {
      console.error('Failed to update prompt:', error);
      // Revert optimistic update if needed
    }
  };

  const handleDeletePrompt = async (slug: string) => {
    try {
      const response = await fetch(`/api/prompts?slug=${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }

      // Remove from catalog
      setCatalog(prev => prev.filter(prompt => prompt.slug !== slug));
      
      // Close modal if it was open
      if (selectedPrompt?.slug === slug) {
        closeModal();
      }
      
      showCopyToast('Prompt deleted successfully!');
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    }
  };

  return (
    <main className="container mx-auto px-6 py-12 relative max-w-7xl">
      <Header 
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} 
        onRefresh={refreshCatalog}
        isRefreshing={isRefreshing}
      />
      
      <ClientOnly>
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
        />
      </ClientOnly>
      
      <ClientOnly>
        {!isLoading ? (
          <>
            <SearchFilters
              searchQuery={searchQuery}
              onSearchChange={(query) => updateSearchParams({ q: query || null })}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onCreateNew={() => setIsCreateModalOpen(true)}
              totalResults={filteredPrompts.length}
            />

            {/* Cards Container */}
            {filteredPrompts.length > 0 ? (
              <div className={
                viewMode === 'grid'
                  ? "cards-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                  : "cards-list space-y-8"
              }>
                {filteredPrompts.map((prompt, index) => (
                  <PromptCard
                    key={prompt.slug}
                    prompt={prompt}
                    viewMode={viewMode}
                    index={index}
                    onPreview={openModal}
                    onCopy={showCopyToast}
                    onTagClick={(tag) => updateSearchParams({ q: tag })}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-20">
                <div className="text-2xl font-bold text-white mb-4">No Templates Found</div>
                <div className="text-white/80 mb-6">Your search or filter criteria did not match any templates. Please try again.</div>
                <button
                  onClick={() => {
                    updateSearchParams({ q: null });
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-medium transition-all duration-300"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Modals */}
            <PromptModal
              isOpen={isModalOpen}
              onClose={closeModal}
              prompt={selectedPrompt}
              onCopy={showCopyToast}
              onEdit={handleEditPrompt}
              onDelete={handleDeletePrompt}
            />

            <CreatePromptModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              onSave={handleCreatePrompt}
            />

            {/* Toast Notification */}
            {showToast && (
              <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg font-medium">
                  {toastMessage}
                </div>
              </div>
            )}

            {/* Scroll to top button */}
            <div className="fixed bottom-8 right-8 z-50">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="glass-card p-3 border-white/20 backdrop-blur-sm text-white/80 hover:text-white transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                aria-label="Scroll to top"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          /* Loading State */
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mx-auto mb-4"></div>
              <p className="text-white font-medium">Loading templates...</p>
              <p className="text-white/60 text-sm mt-2">Discovering amazing AI templates</p>
            </div>
          </div>
        )}
      </ClientOnly>
    </main>
  );
}