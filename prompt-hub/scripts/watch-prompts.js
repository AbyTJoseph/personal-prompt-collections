const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PROMPTS_DIR = path.join(process.cwd(), 'prompts');
const BUILD_SCRIPT = path.join(process.cwd(), 'scripts', 'build-simple.js');

console.log('🔍 Watching prompts directory for changes...');
console.log(`📁 Watching: ${PROMPTS_DIR}`);

// Debounce function to avoid multiple rapid rebuilds
let rebuildTimeout;
function debouncedRebuild() {
  clearTimeout(rebuildTimeout);
  rebuildTimeout = setTimeout(() => {
    console.log('📝 Changes detected, rebuilding catalog...');
    exec(`node ${BUILD_SCRIPT}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error rebuilding catalog:', error);
        return;
      }
      if (stderr) {
        console.error('⚠️  Build warnings:', stderr);
      }
      console.log('✅ Catalog rebuilt successfully');
      console.log(stdout);
    });
  }, 1000); // Wait 1 second after last change
}

// Watch the prompts directory
fs.watch(PROMPTS_DIR, { recursive: true }, (eventType, filename) => {
  if (filename && filename.endsWith('.md')) {
    console.log(`📝 File changed: ${filename}`);
    debouncedRebuild();
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Stopping prompt watcher...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Stopping prompt watcher...');
  process.exit(0);
});

console.log('💡 Press Ctrl+C to stop watching');
