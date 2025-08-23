'use server';

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PresetMapSchema, type Preset } from '@/types/preset';

const PRESETS_FILE = join(process.cwd(), 'data', 'presets.json');
const READ_ONLY = process.env.READ_ONLY === 'true';

function readPresets() {
  try {
    const data = readFileSync(PRESETS_FILE, 'utf8');
    return PresetMapSchema.parse(JSON.parse(data));
  } catch (error) {
    return {};
  }
}

function writePresets(presets: Record<string, Preset[]>) {
  if (READ_ONLY) {
    throw new Error('Cannot write presets in read-only mode');
  }
  writeFileSync(PRESETS_FILE, JSON.stringify(presets, null, 2));
}

export async function savePreset(slug: string, preset: Preset) {
  const presets = readPresets();
  const slugPresets = presets[slug] || [];
  
  // Check if name already exists
  if (slugPresets.some(p => p.name === preset.name)) {
    throw new Error('Preset name already exists');
  }
  
  presets[slug] = [...slugPresets, preset];
  writePresets(presets);
  return presets[slug];
}

export async function deletePreset(slug: string, name: string) {
  const presets = readPresets();
  const slugPresets = presets[slug] || [];
  
  presets[slug] = slugPresets.filter(p => p.name !== name);
  writePresets(presets);
  return presets[slug];
}

export async function renamePreset(slug: string, oldName: string, newName: string) {
  const presets = readPresets();
  const slugPresets = presets[slug] || [];
  
  // Check if new name already exists
  if (slugPresets.some(p => p.name === newName)) {
    throw new Error('New preset name already exists');
  }
  
  presets[slug] = slugPresets.map(p =>
    p.name === oldName ? { ...p, name: newName } : p
  );
  
  writePresets(presets);
  return presets[slug];
}

export async function getPresets(slug: string) {
  const presets = readPresets();
  return presets[slug] || [];
}
