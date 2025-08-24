'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw, Clock } from 'lucide-react';
import { usePromptStore } from '@/store/prompt-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ onOpenCommandPalette, onRefresh, isRefreshing }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const lastUpdated = usePromptStore((state) => state.lastUpdated);
  const refreshPrompts = usePromptStore((state) => state.refreshPrompts);
  const isLoading = usePromptStore((state) => state.isLoading);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never updated';
    
    // Format the date nicely
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }).format(lastUpdated);
  };

  return (
    <header className="text-center mb-12">
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          ✨ Curated Personal Collection of Prompts, Templates and Agent Configurations
        </h1>

        <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Discover and manage your collection of AI prompts, templates, and agent configurations for building intelligent applications.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refreshPrompts()}
                disabled={isLoading}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300 disabled:opacity-50"
                title="Sync with git & refresh prompts"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sync with git & refresh prompts</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 bg-white/10 text-white border-white/20 backdrop-blur-sm px-3 py-2 rounded-full text-xs">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatLastUpdated()}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Last updated time</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {mounted && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm p-3 rounded-full transition-all duration-300"
                >
                  {theme === 'dark' ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
}
