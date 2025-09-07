import { z } from 'zod';

export const VariableTypeEnum = z.enum(['string', 'textarea', 'number', 'select']);

export const PromptVariableSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: VariableTypeEnum,
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional(),
});

export const PromptFrontmatterSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  aliases: z.array(z.string()).optional(),
  collection: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  variables: z.array(PromptVariableSchema).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  likes: z.number().min(0).optional().default(0),
});

export const PromptSchema = z.object({
  slug: z.string(),
  content: z.string(),
  frontmatter: PromptFrontmatterSchema,
});

export type PromptVariable = z.infer<typeof PromptVariableSchema>;
export type PromptFrontmatter = z.infer<typeof PromptFrontmatterSchema>;
export type Prompt = z.infer<typeof PromptSchema>;

// Types for the catalog and search index
export type PromptCatalogEntry = Pick<Prompt, 'slug'> & {
  title: string;
  tags: string[];
  aliases?: string[];
  collection?: string;
  createdAt?: string;
  updatedAt?: string;
  likes?: number;
  excerpt: string;
};

export type SearchIndexEntry = {
  id: string; // slug
  title: string;
  tags: string;
  aliases?: string;
  content: string;
};