import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import { PromptFrontmatterSchema, PromptSchema, type Prompt, type PromptCatalogEntry } from '@/types/prompt';
import { EXCERPT_LENGTH, EXCERPT_LINES } from '@/config/constants';

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
  const processedText = prompt.content
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, EXCERPT_LINES)
    .join(' ');

  const excerpt = processedText.length > EXCERPT_LENGTH
    ? processedText.slice(0, EXCERPT_LENGTH) + '...'
    : processedText;

  return {
    slug: prompt.slug,
    title: prompt.frontmatter.title,
    tags: prompt.frontmatter.tags,
    aliases: prompt.frontmatter.aliases,
    collection: prompt.frontmatter.collection,
    createdAt: prompt.frontmatter.createdAt,
    updatedAt: prompt.frontmatter.updatedAt,
    likes: prompt.frontmatter.likes || 0,
    excerpt,
  };
}

export function generateCatalog(): PromptCatalogEntry[] {
  return getAllPrompts().map(generateCatalogEntry);
}