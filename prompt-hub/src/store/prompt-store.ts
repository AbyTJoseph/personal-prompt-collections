import { create } from 'zustand';
import { Prompt, PromptCategory } from '@/types/prompt';
import { toast } from 'sonner';

interface PromptStore {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  searchQuery: string;
  selectedCategory: string;
  categories: PromptCategory[];
  lastUpdated: Date | null;
  isLoading: boolean;
  
  // Actions
  setPrompts: (prompts: Prompt[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  filterPrompts: () => void;
  getCategories: () => PromptCategory[];
  refreshPrompts: () => Promise<void>;
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  filteredPrompts: [],
  searchQuery: '',
  selectedCategory: 'all',
  categories: [],
  lastUpdated: null,
  isLoading: false,
  
  setPrompts: (prompts) => {
    const categories = get().getCategories();
    set({ prompts, categories });
    get().filterPrompts();
  },
  
  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterPrompts();
  },
  
  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
    get().filterPrompts();
  },
  
  filterPrompts: () => {
    const { prompts, searchQuery, selectedCategory } = get();
    
    let filtered = prompts;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(prompt => prompt.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(prompt => 
        prompt.title.toLowerCase().includes(query) ||
        prompt.description.toLowerCase().includes(query) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    set({ filteredPrompts: filtered });
  },
  
  getCategories: () => {
    const { prompts } = get();
    const categoryMap = new Map<string, number>();
    
    prompts.forEach(prompt => {
      const count = categoryMap.get(prompt.category) || 0;
      categoryMap.set(prompt.category, count + 1);
    });
    
    const categories: PromptCategory[] = [
      { id: 'all', name: 'All', count: prompts.length }
    ];
    
    categoryMap.forEach((count, category) => {
      categories.push({
        id: category,
        name: category.replace('-', '/'),
        count
      });
    });
    
    return categories;
  },

  refreshPrompts: async () => {
    const currentState = get();
    
    // Don't refresh if already loading
    if (currentState.isLoading) {
      return;
    }
    
    set({ isLoading: true });
    
    try {
      // First try to sync with git repository
      try {
        const gitSyncResponse = await fetch('/api/git-sync', {
          method: 'POST',
        });
        
        if (gitSyncResponse.ok) {
          const gitSyncResult = await gitSyncResponse.json();
          
          if (gitSyncResult.changes?.count > 0) {
            toast.success(`Synced ${gitSyncResult.changes.count} prompt files from git`);
          }
        } else {
          const errorData = await gitSyncResponse.json();
          console.error('Git sync failed:', errorData);
          toast.error('Git sync failed, using local files');
        }
      } catch (gitError) {
        console.error('Error during git sync:', gitError);
        toast.error('Git sync error, using local files');
      }
      
      // Then fetch the latest catalog data
      const response = await fetch('/api/prompts');
      
      if (!response.ok) {
        throw new Error(`Failed to refresh prompts: ${response.statusText}`);
      }
      
      const prompts = await response.json();
      
      // Update the store with new prompts
      set({ 
        prompts, 
        lastUpdated: new Date(),
        isLoading: false
      });
      
      // Recalculate categories and filtered prompts
      const categories = get().getCategories();
      set({ categories });
      get().filterPrompts();
      
    } catch (error) {
      console.error('Error refreshing prompts:', error);
      toast.error('Failed to refresh prompts');
      set({ isLoading: false });
    }
  }
}));
