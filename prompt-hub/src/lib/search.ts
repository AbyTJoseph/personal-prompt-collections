import { Document } from 'flexsearch';
import type { PromptCatalogEntry } from '@/types/prompt';

// Create FlexSearch index
const searchIndex = new Document({
  tokenize: 'forward',
  resolution: 9,
  document: {
    id: 'slug',
    index: ['title', 'excerpt', 'tags', 'collection'],
    store: true
  }
});

let isIndexed = false;

export function indexPrompts(prompts: PromptCatalogEntry[]) {
  if (isIndexed) return;
  
  prompts.forEach(prompt => {
    if (prompt.slug && prompt.title && prompt.excerpt && Array.isArray(prompt.tags)) {
      searchIndex.add({
        slug: prompt.slug,
        title: prompt.title,
        excerpt: prompt.excerpt,
        tags: prompt.tags.join(' '),
        collection: prompt.collection || ''
      });
    }
  });
  
  isIndexed = true;
}

export function searchPrompts(query: string, prompts: PromptCatalogEntry[]): PromptCatalogEntry[] {
  if (!query.trim()) {
    return prompts;
  }

  const queryLower = query.toLowerCase().trim();
  
  // Simple but effective search that works reliably
  const searchResults = prompts.filter(prompt => {
    if (!prompt) return false;
    
    // Search in title
    const titleMatch = prompt.title?.toLowerCase().includes(queryLower);
    
    // Search in excerpt/content
    const excerptMatch = prompt.excerpt?.toLowerCase().includes(queryLower);
    
    // Search in tags
    const tagMatch = prompt.tags?.some(tag => 
      tag.toLowerCase().includes(queryLower)
    );
    
    // Search in collection
    const collectionMatch = prompt.collection?.toLowerCase().includes(queryLower);
    
    return titleMatch || excerptMatch || tagMatch || collectionMatch;
  });

  // Sort by relevance (title matches first, then tags, then content)
  return searchResults.sort((a, b) => {
    const aTitle = a.title?.toLowerCase().includes(queryLower) ? 1 : 0;
    const bTitle = b.title?.toLowerCase().includes(queryLower) ? 1 : 0;
    
    if (aTitle !== bTitle) return bTitle - aTitle;
    
    const aTag = a.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ? 1 : 0;
    const bTag = b.tags?.some(tag => tag.toLowerCase().includes(queryLower)) ? 1 : 0;
    
    if (aTag !== bTag) return bTag - aTag;
    
    return 0;
  });
}

export function clearSearchIndex() {
  isIndexed = false;
  // Clear the index by removing all documents
  // Note: FlexSearch doesn't have a clear method, so we'd need to recreate it
  // For now, we'll just mark it as not indexed to force re-indexing
}
