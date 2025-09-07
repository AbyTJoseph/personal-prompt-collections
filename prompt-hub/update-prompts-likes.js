const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

const promptsDir = path.join(__dirname, 'prompts');

function updatePromptFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);

    // Check if likes field already exists
    if (parsed.data.likes === undefined) {
      // Add likes field
      parsed.data.likes = 0;

      // Write back to file
      const updatedContent = matter.stringify(parsed.content, parsed.data);
      fs.writeFileSync(filePath, updatedContent, 'utf8');

      console.log(`Updated: ${path.basename(filePath)}`);
    } else {
      console.log(`Already has likes: ${path.basename(filePath)}`);
    }
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

function updateAllPrompts() {
  const files = fs.readdirSync(promptsDir)
    .filter(file => file.endsWith('.md'))
    .map(file => path.join(promptsDir, file));

  console.log(`Found ${files.length} prompt files to check/update...`);

  files.forEach(updatePromptFile);

  console.log('Done!');
}

updateAllPrompts();
