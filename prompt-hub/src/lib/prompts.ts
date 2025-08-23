import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { PromptFrontmatterSchema, PromptSchema, type Prompt, type PromptCatalogEntry } from '@/types/prompt';

const PROMPTS_DIR = join(process.cwd(), 'prompts');

export function getPromptSlugs(): string[] {
  return readdirSync(PROMPTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

export function getPromptBySlug(slug: string): Prompt {
  const fullPath = join(PROMPTS_DIR, `${slug}.md`);
  const fileContents = readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  // Validate frontmatter
  const frontmatter = PromptFrontmatterSchema.parse(data);
  
  return PromptSchema.parse({
    slug,
    content,
    frontmatter,
  });
}

export function getAllPrompts(): Prompt[] {
  const slugs = getPromptSlugs();
  return slugs.map(slug => getPromptBySlug(slug));
}

export function generateCatalogEntry(prompt: Prompt): PromptCatalogEntry {
  const excerpt = prompt.content
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, 2)
    .join(' ')
    .slice(0, 150) + '...';

  return {
    slug: prompt.slug,
    title: prompt.frontmatter.title,
    tags: prompt.frontmatter.tags,
    aliases: prompt.frontmatter.aliases,
    collection: prompt.frontmatter.collection,
    updatedAt: prompt.frontmatter.updatedAt,
    excerpt,
  };
}

export function generateCatalog(): PromptCatalogEntry[] {
  return getAllPrompts().map(generateCatalogEntry);
}