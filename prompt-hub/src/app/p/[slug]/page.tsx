'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PresetManager } from '@/components/preset-manager';
import { getPresets } from '@/app/actions';
import { ClientOnly } from '@/components/client-only';
import type { Prompt, PromptVariable } from '@/types/prompt';
import type { Preset } from '@/types/preset';

interface PromptDetailPageProps {
  params: {
    slug: string;
  };
}

export default function PromptDetailPage({ params }: PromptDetailPageProps) {
  const router = useRouter();
  const { slug } = use(params);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [resolvedPrompt, setResolvedPrompt] = useState('');
  const [presets, setPresets] = useState<Preset[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [promptResponse, presetsData] = await Promise.all([
          fetch(`/api/prompts/${slug}`),
          getPresets(slug),
        ]);
        
        if (!promptResponse.ok) {
          throw new Error('Prompt not found');
        }
        
        const promptData = await promptResponse.json();
        setPrompt(promptData);
        setPresets(presetsData);
      } catch (error) {
        console.error('Failed to load data:', error);
        router.push('/');
      }
    }

    loadData();
  }, [slug, router]);

  useEffect(() => {
    if (prompt) {
      let resolved = prompt.content;
      Object.entries(formValues).forEach(([key, value]) => {
        resolved = resolved.replace(new RegExp(`{{${key}}}`, 'g'), value);
      });
      setResolvedPrompt(resolved);
    }
  }, [prompt, formValues]);

  const handleVariableChange = (variable: PromptVariable, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [variable.key]: value,
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (!prompt) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading prompt...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-8"
        onClick={() => router.push('/')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Library
      </Button>

      <ClientOnly>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-4">{prompt.frontmatter.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {prompt.frontmatter.tags.map((tag) => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
            {prompt.frontmatter.collection && (
              <Badge variant="outline">{prompt.frontmatter.collection}</Badge>
            )}
          </div>

          {prompt.frontmatter.variables && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Variables</h2>
                                  <PresetManager
                    slug={slug}
                    presets={presets}
                    currentValues={formValues}
                    onApplyPreset={setFormValues}
                    onPresetsChange={setPresets}
                  />
              </div>
              {prompt.frontmatter.variables.map((variable) => (
                <div key={variable.key}>
                  <label className="block text-sm font-medium mb-1">
                    {variable.label}
                    {variable.required && <span className="text-red-500">*</span>}
                  </label>
                  {variable.type === 'textarea' ? (
                    <Textarea
                      value={formValues[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      required={variable.required}
                    />
                  ) : variable.type === 'select' ? (
                    <Select
                      value={formValues[variable.key] || undefined}
                      onValueChange={(value) => handleVariableChange(variable, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {variable.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={variable.type === 'number' ? 'number' : 'text'}
                      value={formValues[variable.key] || ''}
                      onChange={(e) => handleVariableChange(variable, e.target.value)}
                      required={variable.required}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Preview</h2>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(prompt.content)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Raw
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(resolvedPrompt)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Resolved
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(JSON.stringify({
                  title: prompt.frontmatter.title,
                  slug: prompt.slug,
                  values: formValues,
                  resolved: resolvedPrompt,
                }, null, 2))}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
            {resolvedPrompt}
          </div>
        </div>
      </div>
        </ClientOnly>
    </div>
  );
}
