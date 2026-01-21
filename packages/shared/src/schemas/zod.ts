import { z } from 'zod';

export const ComponentTypeSchema = z.enum(['registry:ui', 'registry:block', 'registry:hook']);

export const UploadFileSchema = z.object({
  path: z.string().min(1),
  content: z.string().min(1),
});

export const UploadRequestSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  type: ComponentTypeSchema,
  files: z.array(UploadFileSchema).min(1),
});

export const RegistryFileSchema = z.object({
  path: z.string(),
  content: z.string(),
  type: ComponentTypeSchema,
  target: z.string().optional(),
});

export const RegistryItemSchema = z.object({
  name: z.string(),
  type: ComponentTypeSchema,
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  devDependencies: z.array(z.string()).optional(),
  registryDependencies: z.array(z.string()).optional(),
  files: z.array(RegistryFileSchema),
  tailwind: z.object({
    config: z.record(z.any()).optional(),
  }).optional(),
  cssVars: z.record(z.record(z.string())).optional(),
});
