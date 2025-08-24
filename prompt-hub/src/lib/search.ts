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
  // Return full list when query is empty or whitespace
  if (!query.trim()) {
    return prompts;
  }

  // Ensure the prompts are indexed exactly once per session
  indexPrompts(prompts);

  /*
    FlexSearch `Document` returns an array where each entry corresponds to a field that
    matched (title, excerpt, tags, collection).  Each entry contains a `result` array
    with objects of the form `{ id, score, doc }` when `store: true` and `enrich: true`.

    We flatten these results, deduplicate by `id` (slug) and sort by the best score so
    that the most relevant hits appear first.  This approach is dramatically faster
    than iterating over every prompt on each keystroke because the heavy-lifting is
    handled by FlexSearch’s highly-optimised index.
  */

  // Ask FlexSearch for enriched results so we can access stored documents directly.
  const rawResults = searchIndex.search(query, { enrich: true, limit: 100 }) as any[];

  // Map<slug, { doc: PromptCatalogEntry; score: number }>
  const resultMap = new Map<string, { doc: PromptCatalogEntry; score: number }>();

  for (const fieldResult of rawResults) {
    if (!fieldResult || !Array.isArray(fieldResult.result)) continue;

    for (const item of fieldResult.result) {
      const { id, score, doc } = item;
      // The stored document is already of type PromptCatalogEntry because we added it via `add`.
      const existing = resultMap.get(id);
      if (!existing || existing.score < score) {
        resultMap.set(id, { doc: doc as PromptCatalogEntry, score });
      }
    }
  }

  // Convert to array sorted by descending score (higher score == more relevant)
  const sorted = Array.from(resultMap.values())
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.doc);

  /*
    In the rare event FlexSearch returns no matches (e.g. extremely short query that
    doesn’t meet the index’s tokenisation rules) we fall back to the previous
    lightweight filtering strategy to avoid showing an empty list.
  */
  if (sorted.length === 0) {
    const queryLower = query.toLowerCase().trim();
    return prompts.filter((prompt) => {
      return (
        prompt.title?.toLowerCase().includes(queryLower) ||
        prompt.excerpt?.toLowerCase().includes(queryLower) ||
        prompt.collection?.toLowerCase().includes(queryLower) ||
        prompt.tags?.some((tag) => tag.toLowerCase().includes(queryLower))
      );
    });
  }

  return sorted;
}

export function clearSearchIndex() {
  isIndexed = false;
  // Clear the index by removing all documents
  // Note: FlexSearch doesn't have a clear method, so we'd need to recreate it
  // For now, we'll just mark it as not indexed to force re-indexing
}
