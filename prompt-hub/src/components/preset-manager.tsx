'use client';

import { useState } from 'react';
import { MoreVertical, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { savePreset, deletePreset, renamePreset } from '@/app/actions';
import type { Preset } from '@/types/preset';

interface PresetManagerProps {
  slug: string;
  presets: Preset[];
  currentValues: Record<string, string>;
  onApplyPreset: (values: Record<string, string>) => void;
  onPresetsChange: (presets: Preset[]) => void;
}

export function PresetManager({
  slug,
  presets,
  currentValues,
  onApplyPreset,
  onPresetsChange,
}: PresetManagerProps) {
  const [isNewPresetOpen, setIsNewPresetOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(undefined);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');

  const handleSavePreset = async () => {
    try {
      const preset: Preset = {
        name: newPresetName,
        values: currentValues,
      };
      
      const updatedPresets = await savePreset(slug, preset);
      onPresetsChange(updatedPresets);
      setIsNewPresetOpen(false);
      setNewPresetName('');
      toast.success('Preset saved successfully');
    } catch (error) {
      toast.error('Failed to save preset');
    }
  };

  const handleDeletePreset = async (name: string) => {
    try {
      const updatedPresets = await deletePreset(slug, name);
      onPresetsChange(updatedPresets);
      setSelectedPreset(undefined);
      toast.success('Preset deleted successfully');
    } catch (error) {
      toast.error('Failed to delete preset');
    }
  };

  const handleRenamePreset = async (oldName: string) => {
    try {
      const updatedPresets = await renamePreset(slug, oldName, newName);
      onPresetsChange(updatedPresets);
      setIsRenaming(false);
      setNewName('');
      toast.success('Preset renamed successfully');
    } catch (error) {
      toast.error('Failed to rename preset');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedPreset}
        onValueChange={(value) => {
          setSelectedPreset(value);
          const preset = presets.find(p => p.name === value);
          if (preset) {
            onApplyPreset(preset.values);
          }
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select preset" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.name} value={preset.name}>
              {preset.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPreset && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => {
              setNewName(selectedPreset);
              setIsRenaming(true);
            }}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => handleDeletePreset(selectedPreset)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={isNewPresetOpen} onOpenChange={setIsNewPresetOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Preset name"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
            />
            <Button onClick={handleSavePreset} disabled={!newPresetName}>
              <Save className="h-4 w-4 mr-2" />
              Save Preset
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Preset</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="New name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Button
              onClick={() => handleRenamePreset(selectedPreset)}
              disabled={!newName || newName === selectedPreset}
            >
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
