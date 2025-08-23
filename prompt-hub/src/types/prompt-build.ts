const { z } = require('zod');

const VariableTypeEnum = z.enum(['string', 'textarea', 'number', 'select']);

const PromptVariableSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: VariableTypeEnum,
  required: z.boolean().optional().default(false),
  options: z.array(z.string()).optional(),
});

const PromptFrontmatterSchema = z.object({
  title: z.string(),
  tags: z.array(z.string()),
  aliases: z.array(z.string()).optional(),
  collection: z.string().optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  variables: z.array(PromptVariableSchema).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

const PromptSchema = z.object({
  slug: z.string(),
  content: z.string(),
  frontmatter: PromptFrontmatterSchema,
});

module.exports = {
  PromptVariableSchema,
  PromptFrontmatterSchema,
  PromptSchema,
  VariableTypeEnum,
};
