'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Search, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="text-center mb-12">
      <div className="mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
          LLM Agent Template Hub
        </h1>

        <p className="text-xl text-white/90 max-w-2xl mx-auto leading-relaxed">
          Discover and manage your collection of AI prompts, templates, and agent configurations for building intelligent applications.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button
          onClick={onOpenCommandPalette}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2"
        >
          <Search className="h-4 w-4" />
          Search Templates
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 text-xs font-medium">
            ⌘K
          </kbd>
        </Button>

        {mounted && (
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
        )}
      </div>
    </header>
  );
}
