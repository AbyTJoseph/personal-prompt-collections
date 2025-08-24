const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const http = require('http');
const { WebSocketServer } = require('ws');

// Constants
const PROMPTS_DIR = path.join(process.cwd(), 'prompts');
const BUILD_SCRIPT = path.join(process.cwd(), 'scripts', 'build-simple.js');
const WS_PORT = process.env.WS_PORT || 3001;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'healthy', watching: true }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Create WebSocket server for real-time notifications
const wss = new WebSocketServer({ server });

console.log(`🔌 WebSocket server starting on port ${WS_PORT}`);

// Track connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('🔔 Client connected');
  clients.add(ws);
  
  // Send initial connection confirmation
  ws.send(JSON.stringify({ 
    type: 'connected', 
    message: 'Connected to prompt watcher' 
  }));
  
  ws.on('close', () => {
    console.log('🔕 Client disconnected');
    clients.delete(ws);
  });
  
  // Handle client pings
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
      }
    } catch (e) {
      console.error('Invalid message format:', e);
    }
  });
});

// Broadcast to all connected clients
function broadcast(message) {
  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

// Debounce function to avoid multiple rapid rebuilds
let rebuildTimeout;
function debouncedRebuild(changedFile) {
  clearTimeout(rebuildTimeout);
  rebuildTimeout = setTimeout(() => {
    console.log('📝 Changes detected, rebuilding catalog...');
    
    // Notify clients that a rebuild is starting
    broadcast({ 
      type: 'rebuild_started', 
      file: changedFile,
      timestamp: Date.now() 
    });
    
    exec(`node ${BUILD_SCRIPT}`, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error rebuilding catalog:', error);
        broadcast({ 
          type: 'rebuild_failed', 
          error: error.message,
          timestamp: Date.now() 
        });
        return;
      }
      
      if (stderr) {
        console.warn('⚠️ Build warnings:', stderr);
      }
      
      console.log('✅ Catalog rebuilt successfully');
      
      // Notify clients that rebuild is complete
      broadcast({ 
        type: 'rebuild_complete', 
        file: changedFile,
        timestamp: Date.now() 
      });
    });
  }, 1000); // Wait 1 second after last change
}

// Use chokidar for more reliable file watching
let chokidar;
try {
  chokidar = require('chokidar');
  console.log('✅ Using chokidar for enhanced file watching');
} catch (e) {
  console.log('⚠️ Chokidar not found, falling back to fs.watch');
}

// Start watching files
function startWatching() {
  console.log('🔍 Starting production prompt watcher...');
  console.log(`📁 Watching: ${PROMPTS_DIR}`);
  
  if (chokidar) {
    // Use chokidar for more reliable watching
    const watcher = chokidar.watch(`${PROMPTS_DIR}/**/*.md`, {
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 500,
        pollInterval: 100
      }
    });
    
    watcher
      .on('add', (filepath) => {
        const filename = path.basename(filepath);
        console.log(`📄 New file detected: ${filename}`);
        debouncedRebuild(filename);
      })
      .on('change', (filepath) => {
        const filename = path.basename(filepath);
        console.log(`📝 File changed: ${filename}`);
        debouncedRebuild(filename);
      })
      .on('unlink', (filepath) => {
        const filename = path.basename(filepath);
        console.log(`🗑️ File deleted: ${filename}`);
        debouncedRebuild(filename);
      })
      .on('error', (error) => {
        console.error(`❌ Watcher error: ${error}`);
        broadcast({ 
          type: 'watcher_error', 
          error: error.message,
          timestamp: Date.now() 
        });
      });
      
    // Restart watcher if it fails
    watcher.on('ready', () => {
      console.log('👀 Watcher ready and monitoring for changes');
      broadcast({ 
        type: 'watcher_ready', 
        timestamp: Date.now() 
      });
    });
  } else {
    // Fallback to fs.watch
    try {
      fs.watch(PROMPTS_DIR, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
          console.log(`📝 File changed: ${filename}`);
          debouncedRebuild(filename);
        }
      });
      console.log('👀 Watcher ready and monitoring for changes');
      broadcast({ 
        type: 'watcher_ready', 
        timestamp: Date.now() 
      });
    } catch (error) {
      console.error(`❌ Failed to start file watcher: ${error}`);
      broadcast({ 
        type: 'watcher_error', 
        error: error.message,
        timestamp: Date.now() 
      });
    }
  }
}

// Periodically check and restart watcher if needed
setInterval(() => {
  console.log('🔄 Performing health check on watcher');
  // This is a placeholder for more sophisticated health checks
  // In a production system, you might want to verify the watcher is still active
}, HEALTH_CHECK_INTERVAL);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n👋 Stopping prompt watcher...');
  broadcast({ type: 'watcher_stopping', timestamp: Date.now() });
  server.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Stopping prompt watcher...');
  broadcast({ type: 'watcher_stopping', timestamp: Date.now() });
  server.close();
  process.exit(0);
});

// Start the server and watcher
server.listen(WS_PORT, () => {
  console.log(`🚀 Health check server running on port ${WS_PORT}`);
  startWatching();
});

console.log('💡 Press Ctrl+C to stop watching');
