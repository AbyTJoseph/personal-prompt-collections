import { z } from 'zod';

export const PresetSchema = z.object({
  name: z.string(),
  values: z.record(z.union([z.string(), z.number()])),
});

export const PresetMapSchema = z.record(z.array(PresetSchema));

export type Preset = z.infer<typeof PresetSchema>;
export type PresetMap = z.infer<typeof PresetMapSchema>;
