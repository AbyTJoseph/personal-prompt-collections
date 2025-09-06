'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { usePromptStore } from '@/store/prompt-store';

type WatcherStatus = 'connecting' | 'connected' | 'disconnected' | 'error';
type WatcherMessage = {
  type: string;
  file?: string;
  timestamp: number;
  error?: string;
};

export default function PromptWatcher() {
  const [status, setStatus] = useState<WatcherStatus>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const refreshPrompts = usePromptStore((state) => state.refreshPrompts);
  const isProduction = process.env.NODE_ENV === 'production';
  
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;
    let pingInterval: NodeJS.Timeout;
    
    const connectWebSocket = () => {
      // Only connect in production or if explicitly enabled
      if (!isProduction && !process.env.NEXT_PUBLIC_ENABLE_WATCHER) {
        return;
      }
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = process.env.NEXT_PUBLIC_WS_HOST || window.location.hostname;
      const port = process.env.NEXT_PUBLIC_WS_PORT || '3001';
      const wsUrl = `${protocol}//${host}:${port}`;
      
      setStatus('connecting');
      
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          setStatus('connected');
          console.log('🔌 Connected to prompt watcher');
          
          // Start ping interval to keep connection alive
          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
            }
          }, 30000);
        };
        
        ws.onmessage = (event) => {
          try {
            const message: WatcherMessage = JSON.parse(event.data);
            
            switch (message.type) {
              case 'rebuild_started':
                console.log(`🔄 Rebuilding catalog due to changes in ${message.file}`);
                toast.loading(`Updating prompt: ${message.file}`, {
                  id: 'prompt-update',
                  duration: 10000,
                });
                break;
                
              case 'rebuild_complete':
                console.log('✅ Catalog rebuilt, refreshing prompts');
                setLastUpdate(new Date(message.timestamp));
                toast.success(`Prompt updated: ${message.file}`, {
                  id: 'prompt-update',
                });
                // Refresh prompts from the store
                refreshPrompts();
                break;
                
              case 'rebuild_failed':
                console.error('❌ Catalog rebuild failed:', message.error);
                toast.error(`Failed to update prompt: ${message.error}`, {
                  id: 'prompt-update',
                });
                break;
                
              case 'watcher_error':
                console.error('⚠️ Watcher error:', message.error);
                toast.error(`Prompt watcher error: ${message.error}`);
                break;
                
              case 'pong':
                // Connection is alive
                break;
                
              default:
                console.log('📨 Watcher message:', message);
            }
          } catch (error) {
            console.error('Failed to parse message:', error);
          }
        };
        
        ws.onclose = () => {
          setStatus('disconnected');
          console.log('🔌 Disconnected from prompt watcher');
          
          // Clear ping interval
          if (pingInterval) clearInterval(pingInterval);
          
          // Try to reconnect after a delay
          reconnectTimer = setTimeout(connectWebSocket, 5000);
        };
        
        ws.onerror = (error) => {
          setStatus('error');
          console.error('WebSocket error:', error);
          
          // Close the connection to trigger reconnect
          ws?.close();
        };
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setStatus('error');
        
        // Try to reconnect after a delay
        reconnectTimer = setTimeout(connectWebSocket, 5000);
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [refreshPrompts, isProduction]);
  
  // This component doesn't render anything visible
  // It just manages the WebSocket connection
  return null;
}

