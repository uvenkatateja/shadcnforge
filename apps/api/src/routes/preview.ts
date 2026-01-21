import { Elysia, t } from 'elysia';
import { db } from '../lib/db';
import { components, files } from '@shadcnforge/db';
import { eq } from 'drizzle-orm';

export const previewRoutes = new Elysia({ prefix: '/r' })
  .get('/:id', async ({ params: { id } }) => {
    // Try to find by ID or name
    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.id, id))
      .limit(1);

    if (!component) {
      // Try by name
      const [componentByName] = await db
        .select()
        .from(components)
        .where(eq(components.name, id))
        .limit(1);

      if (!componentByName) {
        throw new Error('Component not found');
      }

      return {
        id: componentByName.id,
        name: componentByName.name,
        type: componentByName.type,
        registryUrl: componentByName.registryUrl,
        installCount: componentByName.installCount,
        createdAt: componentByName.createdAt,
      };
    }

    return {
      id: component.id,
      name: component.name,
      type: component.type,
      registryUrl: component.registryUrl,
      installCount: component.installCount,
      createdAt: component.createdAt,
    };
  })
  .get('/:id/files', async ({ params: { id } }) => {
    // Find component
    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.id, id))
      .limit(1);

    if (!component) {
      throw new Error('Component not found');
    }

    // Get all files
    const componentFiles = await db
      .select()
      .from(files)
      .where(eq(files.componentId, component.id))
      .orderBy(files.order);

    return {
      component: {
        id: component.id,
        name: component.name,
        type: component.type,
      },
      files: componentFiles.map(f => ({
        path: f.path,
        content: f.content,
        fileType: f.fileType,
      })),
    };
  });
