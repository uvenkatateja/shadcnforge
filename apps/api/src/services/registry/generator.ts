import type { RegistryItem, RegistryIndex } from '@shadcnforge/shared';
import { parseFile, isShadcnComponent, extractComponentName } from '../ast/parser';

export interface ComponentData {
  name: string;
  type: 'registry:ui' | 'registry:block' | 'registry:hook';
  files: Array<{
    path: string;
    content: string;
    fileType: string;
  }>;
}

/**
 * Generate shadcn-compatible registry JSON from component data
 * This uses deterministic parsing and graph algorithms (NOT AI)
 */
export function generateRegistryItem(data: ComponentData): RegistryItem {
  const registryDependencies = new Set<string>();
  const dependencies = new Set<string>();

  // Parse all files to extract dependencies
  data.files.forEach((file) => {
    if (file.fileType === 'tsx' || file.fileType === 'ts') {
      const parsed = parseFile(file.content, file.path);

      parsed.imports.forEach((imp) => {
        // Check if it's a shadcn component dependency
        if (isShadcnComponent(imp.source)) {
          const componentName = extractComponentName(imp.source);
          if (componentName) {
            registryDependencies.add(componentName);
          }
        }
        // Check if it's an npm package (not local import)
        else if (!imp.source.startsWith('.') && !imp.source.startsWith('@/')) {
          // Extract package name (handle scoped packages)
          const packageName = imp.source.startsWith('@')
            ? imp.source.split('/').slice(0, 2).join('/')
            : imp.source.split('/')[0];
          dependencies.add(packageName);
        }
      });
    }
  });

  // Build registry item
  const registryItem: RegistryItem = {
    name: data.name,
    type: data.type,
    files: data.files.map((file) => ({
      path: file.path,
      content: file.content,
      type: data.type,
      target: file.path.startsWith('components/ui/') ? file.path : undefined,
    })),
  };

  // Add dependencies if found
  if (dependencies.size > 0) {
    registryItem.dependencies = Array.from(dependencies).sort();
  }

  if (registryDependencies.size > 0) {
    registryItem.registryDependencies = Array.from(registryDependencies).sort();
  }

  return registryItem;
}

/**
 * Generate registry index entry (for the main registry index)
 */
export function generateRegistryIndex(item: RegistryItem): RegistryIndex {
  return {
    name: item.name,
    type: item.type,
    description: item.description,
    dependencies: item.dependencies,
    devDependencies: item.devDependencies,
    registryDependencies: item.registryDependencies,
    files: item.files.map((f) => f.path),
  };
}
