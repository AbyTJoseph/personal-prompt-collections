const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const PROMPTS_DIR = path.join(process.cwd(), 'prompts');
const PUBLIC_DATA_DIR = path.join(process.cwd(), 'public', 'data');

function getPromptSlugs() {
  return fs.readdirSync(PROMPTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}

function getPromptBySlug(slug) {
  const fullPath = path.join(PROMPTS_DIR, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  
  return {
    slug,
    content,
    frontmatter: data,
  };
}

function getAllPrompts() {
  const slugs = getPromptSlugs();
  return slugs.map(slug => getPromptBySlug(slug));
}

function generateCatalogEntry(prompt) {
  const excerpt = prompt.content
    .split('\n')
    .filter(line => line.trim() !== '')
    .slice(0, 2)
    .join(' ')
    .slice(0, 150) + '...';

  return {
    slug: prompt.slug,
    title: prompt.frontmatter.title,
    tags: prompt.frontmatter.tags || [],
    aliases: prompt.frontmatter.aliases,
    collection: prompt.frontmatter.collection,
    updatedAt: prompt.frontmatter.updatedAt,
    excerpt,
  };
}

function generateSearchIndex() {
  const prompts = getAllPrompts();
  
  return prompts.map(prompt => ({
    id: prompt.slug,
    title: prompt.frontmatter.title,
    tags: (prompt.frontmatter.tags || []).join(' '),
    aliases: prompt.frontmatter.aliases ? prompt.frontmatter.aliases.join(' ') : '',
    content: prompt.content,
  }));
}

async function main() {
  // Generate catalog
  const catalog = getAllPrompts().map(generateCatalogEntry);
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'catalog.json'),
    JSON.stringify(catalog, null, 2)
  );

  // Generate search index
  const searchIndex = generateSearchIndex();
  fs.writeFileSync(
    path.join(PUBLIC_DATA_DIR, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  );

  console.log('✨ Generated catalog and search index');
}

main().catch(console.error);
