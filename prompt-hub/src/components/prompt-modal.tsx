'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, X, Edit2, Plus, Trash2, ThumbsUp } from 'lucide-react';
import type { PromptCatalogEntry } from '@/types/prompt';
import type { Prompt } from '@/types/prompt';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: PromptCatalogEntry | null;
  onCopy?: () => void;
  onEdit?: (prompt: PromptCatalogEntry) => void;
  onDelete?: (slug: string) => void;
}

export function PromptModal({ isOpen, onClose, prompt, onCopy, onEdit, onDelete }: PromptModalProps) {
  const [copied, setCopied] = useState(false);
  const [fullPrompt, setFullPrompt] = useState<Prompt | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likes, setLikes] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Fetch full prompt content when modal opens
  useEffect(() => {
    async function fetchFullPrompt() {
      if (isOpen && prompt && !fullPrompt) {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/prompts/${prompt.slug}`);
          if (response.ok) {
            const data = await response.json();
            setFullPrompt(data);
            setEditedTags(data.frontmatter.tags || []);
            setEditedTitle(data.frontmatter.title || '');
            setEditedContent(data.content || '');
            setLikes(data.frontmatter.likes || 0);
          }
        } catch (error) {
          console.error('Failed to fetch full prompt:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchFullPrompt();
  }, [isOpen, prompt, fullPrompt]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          setIsEditing(false);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      
      // Get scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${window.scrollY}px`;
      document.body.style.width = '100%';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      
      setCopied(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      
      if (isOpen) {
        // Restore body scroll
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.paddingRight = '';
        
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      }
    };
  }, [isOpen, onClose, isEditing]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFullPrompt(null);
      setIsEditing(false);
      setNewTag('');
      setEditedTags([]);
      setEditedTitle('');
      setEditedContent('');
      setIsSaving(false);
      setLikes(0);
      setIsLiking(false);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    if (!fullPrompt && !prompt) return;

    try {
      const textToCopy = fullPrompt ? fullPrompt.content : prompt!.excerpt;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleLike = async () => {
    if (!prompt || isLiking) return;

    setIsLiking(true);
    try {
      const response = await fetch(`/api/prompts/${prompt.slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to like prompt');
      }

      const data = await response.json();
      setLikes(data.likes);

      // Update the full prompt state if it exists
      if (fullPrompt) {
        setFullPrompt({
          ...fullPrompt,
          frontmatter: {
            ...fullPrompt.frontmatter,
            likes: data.likes,
          },
        });
      }
    } catch (error) {
      console.error('Failed to like prompt:', error);
      alert('Failed to like prompt. Please try again.');
    } finally {
      setIsLiking(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTags.includes(newTag.trim())) {
      setEditedTags([...editedTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveChanges = async () => {
    if (!prompt || !fullPrompt) return;
    
    setIsSaving(true);
    try {
      const response = await fetch(`/api/prompts/${prompt.slug}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedTitle,
          content: editedContent,
          tags: editedTags,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      const updated = await response.json();
      
      // Update the full prompt state
      setFullPrompt({
        ...fullPrompt,
        frontmatter: {
          ...fullPrompt.frontmatter,
          title: editedTitle,
          tags: editedTags,
        },
        content: editedContent,
      });
      
      setIsEditing(false);
      
      // Notify parent component
      if (onEdit) {
        onEdit({ ...prompt, title: editedTitle, tags: editedTags });
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt || !onDelete) return;
    
    setIsDeleting(true);
    try {
      // Call the parent's delete handler
      onDelete(prompt.slug);
      onClose();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      alert('Failed to delete prompt. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close modal on actual clicks, not on scroll wheel events
    if (e.target === e.currentTarget && e.type === 'click') {
      onClose();
    }
  };

  if (!prompt) return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" data-testid="modal-backdrop" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-6xl h-[85vh] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              data-testid="prompt-modal"
              onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking on modal
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex-1">
                  {!isEditing ? (
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2" data-testid="modal-title">
                      {fullPrompt?.frontmatter.title || prompt.title}
                    </h2>
                  ) : (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="text-2xl font-bold text-gray-900 dark:text-white mb-2 bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none w-full"
                      placeholder="Enter title..."
                    />
                  )}

                  {/* Likes Count */}
                  <div className="flex items-center gap-2 mb-3" data-testid="modal-like-count">
                    <ThumbsUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {likes} {likes === 1 ? 'like' : 'likes'}
                    </span>
                  </div>

                  {/* Tags Section */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isEditing ? (
                      <>
                        {(fullPrompt?.frontmatter.tags || prompt.tags).map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit Prompt
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-full text-sm hover:bg-red-200 dark:hover:bg-red-800/50 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete Prompt
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-wrap items-center gap-2 w-full">
                        {editedTags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                          >
                            #{tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-red-200 dark:hover:bg-red-800/50 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            placeholder="Add tag..."
                            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={handleAddTag}
                            className="p-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveChanges}
                            disabled={isSaving}
                            className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? 'Saving...' : 'Save All'}
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditedTags(fullPrompt?.frontmatter.tags || prompt.tags);
                              setEditedTitle(fullPrompt?.frontmatter.title || prompt.title);
                              setEditedContent(fullPrompt?.content || '');
                              setNewTag('');
                            }}
                            disabled={isSaving}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors ml-4"
                  data-testid="modal-close-button"
                >
                  <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading full prompt...</span>
                  </div>
                ) : (
                  <div
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 h-full overflow-y-auto custom-scrollbar"
                    data-testid="modal-content"
                    onWheel={(e) => e.stopPropagation()} // Ensure scroll events don't bubble to backdrop
                  >
                    {!isEditing ? (
                      <div className="prose prose-gray dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed break-words">
                          {fullPrompt ? fullPrompt.content : prompt.excerpt}
                        </pre>
                      </div>
                    ) : (
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-full resize-none bg-transparent text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed focus:outline-none border-none"
                        placeholder="Enter prompt content..."
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {fullPrompt?.frontmatter.collection && (
                    <span className="capitalize">{fullPrompt.frontmatter.collection} Collection</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    disabled={isLiking}
                    className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                    data-testid="like-prompt-button"
                  >
                    <ThumbsUp className={`h-4 w-4 ${isLiking ? 'animate-pulse' : ''}`} />
                    {isLiking ? 'Liking...' : 'Like'}
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
                    data-testid="copy-prompt-button"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Confirmation Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-300" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Prompt
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete "{prompt?.title}"? This action cannot be undone.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
