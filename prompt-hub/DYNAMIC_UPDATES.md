# Dynamic Prompt Updates

This system allows you to update your prompts in real-time without rebuilding the application. Your prompts are stored as markdown files and can be updated dynamically, with instant updates in both development and production environments.

## How It Works

1. **Markdown Files**: Prompts are stored as `.md` files in the `prompts/` directory
2. **Dynamic API**: The `/api/prompts` endpoint reads markdown files at runtime
3. **Real-time Updates**: File changes are detected and pushed to connected clients
4. **WebSocket Notifications**: Clients receive instant notifications when prompts change
5. **Git Sync**: Automatically sync with your git repository when refreshing
6. **Manual Refresh**: Click the refresh button (🔄) in the header to sync with git and update immediately
7. **Last Updated Time**: The header shows when prompts were last updated

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

### Option 1: With Real-time File Watching (Recommended)

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Start with file watching enabled
npm run start:watch
```

This runs both the Next.js production server and a WebSocket server that watches for file changes and notifies connected clients in real-time.

### Option 2: Standard Production Deployment

```bash
# Install dependencies
npm install

# Build the app
npm run build

# Start the Next.js server
npm start

# In a separate terminal, start the file watcher
npm run watch:prod
```

### Production Features

In production, the app will:
- Read prompts dynamically from the `/api/prompts` endpoint
- Watch for file changes in real-time using WebSockets
- Show toast notifications when prompts are updated
- Display a "Last updated" timestamp in the header
- Provide a manual refresh button
- Automatically reconnect if the WebSocket connection is lost
- Handle file system events (add, change, delete) for prompt files

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
- ✅ **Real-time updates** with WebSocket notifications
- ✅ **Instant feedback** with toast notifications
- ✅ **Git synchronization** - pull latest changes from your repository
- ✅ **Markdown files** for easy editing
- ✅ **Version control friendly** - track changes in git
- ✅ **Production ready** - works in deployed environments
- ✅ **Fallback support** - still works with static catalog if needed
- ✅ **Resilient connections** - automatic reconnection if WebSocket disconnects
- ✅ **Visual feedback** - loading indicators and timestamps

## Troubleshooting

- If prompts don't update, check the browser console for errors
- Ensure the `/api/prompts` endpoint is accessible
- Verify markdown files have valid frontmatter
- Check that the prompts directory is readable by the application
- Verify the WebSocket server is running (check for port 3001 in use)
- Look for file permission issues if watching doesn't work
- Check network connectivity between client and WebSocket server
- Ensure the WebSocket port is accessible and not blocked by firewalls

## Environment Variables

You can customize the WebSocket connection with these environment variables:

- `NEXT_PUBLIC_WS_HOST`: The hostname for WebSocket connections (defaults to window.location.hostname)
- `NEXT_PUBLIC_WS_PORT`: The port for WebSocket connections (defaults to 3001)
- `NEXT_PUBLIC_ENABLE_WATCHER`: Set to "true" to enable the watcher in development mode
