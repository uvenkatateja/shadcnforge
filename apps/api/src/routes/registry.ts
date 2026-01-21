import { Elysia, t } from 'elysia';
import { db } from '../lib/db';
import { components, files } from '@shadcnforge/db';
import { eq } from 'drizzle-orm';

export const registryRoutes = new Elysia({ prefix: '/registry' })
  .get('/', async () => {
    const allComponents = await db.select({
      name: components.name,
      type: components.type,
      registryUrl: components.registryUrl,
      installCount: components.installCount,
    }).from(components);

    return allComponents;
  })
  .get('/:name', async ({ params: { name } }) => {
    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.name, name))
      .limit(1);

    if (!component) {
      throw new Error('Component not found');
    }

    // Increment install count
    await db
      .update(components)
      .set({ installCount: component.installCount + 1 })
      .where(eq(components.id, component.id));

    // Return registry URL (points to Vercel Blob)
    return {
      name: component.name,
      type: component.type,
      registryUrl: component.registryUrl,
    };
  })
  .get('/:name/files', async ({ params: { name } }) => {
    const [component] = await db
      .select()
      .from(components)
      .where(eq(components.name, name))
      .limit(1);

    if (!component) {
      throw new Error('Component not found');
    }

    const componentFiles = await db
      .select()
      .from(files)
      .where(eq(files.componentId, component.id));

    return {
      name: component.name,
      files: componentFiles,
    };
  });
