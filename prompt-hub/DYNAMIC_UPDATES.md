# Dynamic Prompt Updates

This system allows you to update your prompts in real-time without rebuilding the application. Your prompts are stored as markdown files and can be updated dynamically.

## How It Works

1. **Markdown Files**: Prompts are stored as `.md` files in the `prompts/` directory
2. **Dynamic API**: The `/api/prompts` endpoint reads markdown files at runtime
3. **Auto-refresh**: The app automatically refreshes every 30 seconds
4. **Manual Refresh**: Click the refresh button (🔄) in the header to update immediately

## Development Workflow

### Option 1: Auto-watch (Recommended)
```bash
npm run dev:watch
```
This runs both the Next.js dev server and a file watcher that automatically rebuilds the catalog when markdown files change.

### Option 2: Manual watching
```bash
# Terminal 1: Start the dev server
npm run dev

# Terminal 2: Watch for prompt changes
npm run watch
```

### Option 3: Manual rebuild
```bash
npm run index
```

## Production Deployment

In production, the app will:
- Read prompts dynamically from the `/api/prompts` endpoint
- Auto-refresh every 30 seconds
- Show a "Last updated" timestamp
- Provide a manual refresh button

## File Structure

```
prompts/
├── CIA-Investigator.md
├── life-prediction.md
├── person-of-interest-report-generator.md
└── ... (other prompt files)
```

## Adding New Prompts

1. Create a new `.md` file in the `prompts/` directory
2. Add frontmatter with required fields:
   ```yaml
   ---
   title: "Your Prompt Title"
   tags: ["tag1", "tag2"]
   collection: "optional-collection"
   updatedAt: "2024-01-01"
   ---
   
   Your prompt content here...
   ```
3. The prompt will appear automatically within 30 seconds, or click refresh

## Benefits

- ✅ **No rebuilds needed** for content updates
- ✅ **Real-time updates** with auto-refresh
- ✅ **Markdown files** for easy editing
- ✅ **Version control friendly** - track changes in git
- ✅ **Production ready** - works in deployed environments
- ✅ **Fallback support** - still works with static catalog if needed

## Troubleshooting

- If prompts don't update, check the browser console for errors
- Ensure the `/api/prompts` endpoint is accessible
- Verify markdown files have valid frontmatter
- Check that the prompts directory is readable by the application
