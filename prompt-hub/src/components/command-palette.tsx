'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { SearchIndexEntry } from '@/types/prompt';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [searchIndex, setSearchIndex] = useState<SearchIndexEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSearchIndex() {
      try {
        const response = await fetch('/data/search-index.json');
        const data = await response.json();
        setSearchIndex(data);
      } catch (error) {
        console.error('Failed to load search index:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSearchIndex();
  }, []);

  const handleSelect = (value: string) => {
    router.push(`/p/${value}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 gap-0">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="h-4 w-4 shrink-0 text-gray-500" />
            <Command.Input
              placeholder="Search prompts..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            {loading ? (
              <Command.Loading>Loading...</Command.Loading>
            ) : (
              searchIndex.map((item) => (
                <Command.Item
                  key={item.id}
                  value={item.id}
                  onSelect={handleSelect}
                  className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100 aria-selected:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span>{item.title}</span>
                  {item.tags && (
                    <span className="ml-auto text-xs text-gray-500">
                      {item.tags}
                    </span>
                  )}
                </Command.Item>
              ))
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}