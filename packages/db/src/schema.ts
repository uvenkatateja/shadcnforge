import { pgTable, uuid, text, integer, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const components = pgTable('components', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  type: text('type').notNull(),
  registryUrl: text('registry_url').notNull(),
  blobUrls: jsonb('blob_urls').notNull().$type<string[]>(),
  installCount: integer('install_count').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const files = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  componentId: uuid('component_id').notNull().references(() => components.id, { onDelete: 'cascade' }),
  path: text('path').notNull(),
  content: text('content').notNull(),
  fileType: text('file_type').notNull(),
  order: integer('order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const dependencies = pgTable('dependencies', {
  id: uuid('id').primaryKey().defaultRandom(),
  fileId: uuid('file_id').notNull().references(() => files.id, { onDelete: 'cascade' }),
  importPath: text('import_path').notNull(),
  resolved: boolean('resolved').notNull().default(false),
  targetFileId: uuid('target_file_id').references(() => files.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const componentsRelations = relations(components, ({ many }) => ({
  files: many(files),
}));

export const filesRelations = relations(files, ({ one, many }) => ({
  component: one(components, {
    fields: [files.componentId],
    references: [components.id],
  }),
  dependencies: many(dependencies),
  dependents: many(dependencies, {
    relationName: 'targetFile',
  }),
}));

export const dependenciesRelations = relations(dependencies, ({ one }) => ({
  file: one(files, {
    fields: [dependencies.fileId],
    references: [files.id],
  }),
  targetFile: one(files, {
    fields: [dependencies.targetFileId],
    references: [files.id],
    relationName: 'targetFile',
  }),
}));
