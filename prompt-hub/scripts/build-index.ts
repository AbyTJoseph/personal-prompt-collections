const { writeFileSync } = require('fs');
const { join } = require('path');
const { getAllPrompts, generateCatalog } = require('../src/lib/prompts');

const PUBLIC_DATA_DIR = join(process.cwd(), 'public', 'data');

function generateSearchIndex() {
  const prompts = getAllPrompts();
  
  return prompts.map(prompt => ({
    id: prompt.slug,
    title: prompt.frontmatter.title,
    tags: prompt.frontmatter.tags.join(' '),
    aliases: prompt.frontmatter.aliases?.join(' '),
    content: prompt.content,
  }));
}

async function main() {
  // Generate catalog
  const catalog = generateCatalog();
  writeFileSync(
    join(PUBLIC_DATA_DIR, 'catalog.json'),
    JSON.stringify(catalog, null, 2)
  );

  // Generate search index
  const searchIndex = generateSearchIndex();
  writeFileSync(
    join(PUBLIC_DATA_DIR, 'search-index.json'),
    JSON.stringify(searchIndex, null, 2)
  );

  console.log('✨ Generated catalog and search index');
}

main().catch(console.error);
