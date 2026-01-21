import { Elysia, t } from 'elysia';
import { db } from '../lib/db';
import { components, files, dependencies } from '@shadcnforge/db';
import { UploadRequestSchema } from '@shadcnforge/shared';
import { generateRegistryItem } from '../services/registry/generator';
import { analyzeFiles, validateDependencies } from '../services/ast/import-analyzer';
import { put } from '@vercel/blob';

export const uploadRoutes = new Elysia({ prefix: '/upload' })
  .post('/', async ({ body }) => {
    // Validate request
    const validated = UploadRequestSchema.parse(body);

    // Step 1: Analyze all files and build dependency graph
    const graph = analyzeFiles(validated.files);
    
    // Step 2: Validate dependencies
    const validation = validateDependencies(graph);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Missing dependencies detected. Please upload all required files.',
      };
    }

    // Step 3: Generate registry JSON with all dependencies
    const registryItem = generateRegistryItem({
      name: validated.name,
      type: validated.type,
      files: validated.files.map((f) => ({
        path: f.path,
        content: f.content,
        fileType: f.path.endsWith('.tsx') ? 'tsx' : f.path.endsWith('.ts') ? 'ts' : 'json',
      })),
    });

    // Add analyzed dependencies to registry
    if (graph.npmDependencies.size > 0) {
      registryItem.dependencies = Array.from(graph.npmDependencies).sort();
    }
    if (graph.shadcnDependencies.size > 0) {
      registryItem.registryDependencies = Array.from(graph.shadcnDependencies).sort();
    }

    // Step 4: Upload registry JSON to Vercel Blob
    const registryJson = JSON.stringify(registryItem, null, 2);
    const registryBlob = await put(`registry/${validated.name}.json`, registryJson, {
      access: 'public',
      contentType: 'application/json',
    });

    // Step 5: Upload individual files to Vercel Blob
    const blobUrls: string[] = [];
    for (const file of validated.files) {
      const blob = await put(`components/${validated.name}/${file.path}`, file.content, {
        access: 'public',
        contentType: 'text/plain',
      });
      blobUrls.push(blob.url);
    }

    // Step 6: Save to database
    const [component] = await db.insert(components).values({
      name: validated.name,
      type: validated.type,
      registryUrl: registryBlob.url,
      blobUrls,
    }).returning();

    // Step 7: Save files with dependency information
    const fileRecords = await db.insert(files).values(
      validated.files.map((file, index) => ({
        componentId: component.id,
        path: file.path,
        content: file.content,
        fileType: file.path.endsWith('.tsx') ? 'tsx' : file.path.endsWith('.ts') ? 'ts' : 'json',
        order: index,
      }))
    ).returning();

    // Step 8: Save dependencies
    for (const fileRecord of fileRecords) {
      const analyzed = graph.files.get(fileRecord.path);
      if (!analyzed) continue;

      const deps = [
        ...analyzed.imports.shadcn.map(name => ({
          fileId: fileRecord.id,
          importPath: `@/components/ui/${name}`,
          resolved: false,
        })),
        ...analyzed.imports.local.map(path => ({
          fileId: fileRecord.id,
          importPath: path,
          resolved: true,
        })),
      ];

      if (deps.length > 0) {
        await db.insert(dependencies).values(deps);
      }
    }

    return {
      success: true,
      component: {
        id: component.id,
        name: component.name,
        registryUrl: component.registryUrl,
        files: validated.files.length,
        dependencies: {
          npm: Array.from(graph.npmDependencies),
          shadcn: Array.from(graph.shadcnDependencies),
        },
      },
    };
  }, {
    body: t.Object({
      name: t.String(),
      type: t.String(),
      files: t.Array(t.Object({
        path: t.String(),
        content: t.String(),
      })),
    }),
  })
  .post('/analyze', async ({ body }) => {
    // Analyze files without uploading (for preview/validation)
    const validated = UploadRequestSchema.parse(body);
    
    const graph = analyzeFiles(validated.files);
    const validation = validateDependencies(graph);

    return {
      valid: validation.valid,
      errors: validation.errors,
      npmDependencies: Array.from(graph.npmDependencies),
      shadcnDependencies: Array.from(graph.shadcnDependencies),
      files: Array.from(graph.files.entries()).map(([path, analyzed]) => ({
        path,
        imports: analyzed.imports,
        exports: analyzed.exports,
        missing: analyzed.missing,
      })),
    };
  }, {
    body: t.Object({
      name: t.String(),
      type: t.String(),
      files: t.Array(t.Object({
        path: t.String(),
        content: t.String(),
      })),
    }),
  });
