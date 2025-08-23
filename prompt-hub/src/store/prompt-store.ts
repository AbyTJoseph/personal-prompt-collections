import { create } from 'zustand';
import { Prompt, PromptCategory } from '@/types/prompt';

interface PromptStore {
  prompts: Prompt[];
  filteredPrompts: Prompt[];
  searchQuery: string;
  selectedCategory: string;
  categories: PromptCategory[];
  
  // Actions
  setPrompts: (prompts: Prompt[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  filterPrompts: () => void;
  getCategories: () => PromptCategory[];
}

export const usePromptStore = create<PromptStore>((set, get) => ({
  prompts: [],
  filteredPrompts: [],
  searchQuery: '',
  selectedCategory: 'all',
  categories: [],
  
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
  }
}));
