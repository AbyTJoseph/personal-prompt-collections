'use client';

import { motion } from 'framer-motion';
import { Eye, Copy } from 'lucide-react';
import type { PromptCatalogEntry } from '@/types/prompt';

interface PromptCardProps {
  prompt: PromptCatalogEntry;
  viewMode: 'grid' | 'list';
  index?: number;
  onPreview?: (prompt: PromptCatalogEntry) => void;
  onCopy?: () => void;
  onTagClick?: (tag: string) => void;
}

export function PromptCard({ prompt, viewMode, index = 0, onPreview, onCopy, onTagClick }: PromptCardProps) {
  // Safety check for malformed data
  if (!prompt || !prompt.slug || !prompt.title || !prompt.excerpt || !Array.isArray(prompt.tags)) {
    return null;
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.05
      }
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial="hidden"
        whileInView="visible"
        variants={cardVariants}
        viewport={{ once: true }}
        className="group"
      >
        <div
          className="glass-card p-6 md:p-8 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl cursor-pointer flex gap-4 items-start min-h-[260px]"
          onClick={() => onPreview?.(prompt)}
        >
          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                {prompt.title}
              </h3>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                <button
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview?.(prompt);
                  }}
                >
                  <Eye className="h-4 w-4 text-gray-600 dark:text-white" />
                </button>
                <button
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(prompt.excerpt);
                    onCopy?.();
                  }}
                >
                  <Copy className="h-4 w-4 text-gray-600 dark:text-white" />
                </button>
              </div>
            </div>

            {/* Description - show more in list view */}
            <p 
              className="text-gray-600 dark:text-white/80 mb-3 leading-normal text-sm line-clamp-6"
            >
              {prompt.excerpt.length > 800 ? prompt.excerpt.slice(0, 800) + '...' : prompt.excerpt}
            </p>

            {/* Tags and Meta */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {prompt.tags.slice(0, 6).map((tag) => (
                  <button
                    type="button"
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    className="px-2 py-1 bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white/80 rounded-full text-xs backdrop-blur-sm font-medium hover:bg-blue-200 dark:hover:bg-white/20 transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
                {prompt.tags.length > 6 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 rounded-full text-xs backdrop-blur-sm font-medium">
                    +{prompt.tags.length - 6}
                  </span>
                )}
              </div>
              
              <div className="text-sm text-gray-500 dark:text-white/60 ml-4">
                {prompt.collection && (
                  <span className="capitalize">{prompt.collection} • </span>
                )}
                Template
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Grid view (default)
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={cardVariants}
      viewport={{ once: true }}
      className="group"
    >
      <div
        className="glass-card p-4 md:p-6 flex flex-col h-full transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer min-h-[380px]"
        onClick={() => onPreview?.(prompt)}
      >
        {/* Card Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white leading-tight flex-1 mr-4">
            {prompt.title}
          </h3>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                onPreview?.(prompt);
              }}
            >
              <Eye className="h-4 w-4 text-gray-600 dark:text-white" />
            </button>
            <button
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(prompt.excerpt);
                onCopy?.();
              }}
            >
              <Copy className="h-4 w-4 text-gray-600 dark:text-white" />
            </button>
          </div>
        </div>

        {/* Card Description - show more content in grid */}
        <p 
          className="text-gray-600 dark:text-white/80 mb-2 flex-grow leading-normal text-sm line-clamp-16"
        >
          {prompt.excerpt.length > 600 ? prompt.excerpt.slice(0, 600) + '...' : prompt.excerpt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {prompt.tags.slice(0, 4).map((tag) => (
            <button
              type="button"
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick?.(tag);
              }}
              className="px-2 py-1 bg-blue-100 dark:bg-white/10 text-blue-700 dark:text-white/80 rounded-full text-xs backdrop-blur-sm font-medium hover:bg-blue-200 dark:hover:bg-white/20 transition-colors"
            >
              #{tag}
            </button>
          ))}
          {prompt.tags.length > 4 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/60 rounded-full text-xs backdrop-blur-sm font-medium">
              +{prompt.tags.length - 4}
            </span>
          )}
        </div>

        {/* Card Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-200 dark:border-white/10 mt-auto">
          <div className="text-xs text-gray-500 dark:text-white/60">
            {prompt.collection && (
              <span className="capitalize">{prompt.collection}</span>
            )}
          </div>
          <div className="text-gray-500 dark:text-white/60 text-xs">
            Template
          </div>
        </div>
      </div>
    </motion.div>
  );
}