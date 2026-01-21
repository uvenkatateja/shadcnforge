import { parseFile, isLocalImport, isShadcnComponent, extractComponentName } from './parser';

export interface AnalyzedFile {
  path: string;
  content: string;
  imports: {
    local: string[];           // Local file imports (./user-avatar)
    shadcn: string[];          // shadcn components (@/components/ui/button)
    npm: string[];             // npm packages (lucide-react)
  };
  exports: string[];
  missing: string[];           // Missing local files
}

export interface DependencyGraph {
  files: Map<string, AnalyzedFile>;
  npmDependencies: Set<string>;
  shadcnDependencies: Set<string>;
  errors: string[];
}

/**
 * Analyze multiple files and build dependency graph
 * This is the CORE logic - deterministic graph analysis
 */
export function analyzeFiles(files: Array<{ path: string; content: string }>): DependencyGraph {
  const graph: DependencyGraph = {
    files: new Map(),
    npmDependencies: new Set(),
    shadcnDependencies: new Set(),
    errors: [],
  };

  // Create a map of available files for quick lookup
  const availableFiles = new Set(files.map(f => normalizeFilePath(f.path)));

  // First pass: Parse all files
  for (const file of files) {
    const parsed = parseFile(file.content, file.path);
    
    const analyzed: AnalyzedFile = {
      path: file.path,
      content: file.content,
      imports: {
        local: [],
        shadcn: [],
        npm: [],
      },
      exports: parsed.exports,
      missing: [],
    };

    // Categorize imports
    for (const imp of parsed.imports) {
      if (isShadcnComponent(imp.source)) {
        const componentName = extractComponentName(imp.source);
        if (componentName) {
          analyzed.imports.shadcn.push(componentName);
          graph.shadcnDependencies.add(componentName);
        }
      } else if (isLocalImport(imp.source)) {
        const resolvedPath = resolveLocalImport(file.path, imp.source);
        analyzed.imports.local.push(resolvedPath);
        
        // Check if the local file exists in uploads
        if (!availableFiles.has(normalizeFilePath(resolvedPath))) {
          analyzed.missing.push(resolvedPath);
        }
      } else {
        // Extract npm package name
        const packageName = extractPackageName(imp.source);
        analyzed.imports.npm.push(packageName);
        graph.npmDependencies.add(packageName);
      }
    }

    graph.files.set(file.path, analyzed);
  }

  // Second pass: Validate all dependencies
  for (const [filePath, analyzed] of graph.files) {
    if (analyzed.missing.length > 0) {
      graph.errors.push(
        `File "${filePath}" imports missing files: ${analyzed.missing.join(', ')}`
      );
    }
  }

  return graph;
}

/**
 * Resolve local import path relative to current file
 * Example: resolveLocalImport('components/card.tsx', './avatar') -> 'components/avatar'
 */
function resolveLocalImport(currentFile: string, importPath: string): string {
  // Remove file extension from current file
  const currentDir = currentFile.split('/').slice(0, -1).join('/');
  
  // Handle @/ alias (maps to root)
  if (importPath.startsWith('@/')) {
    return importPath.replace('@/', '');
  }
  
  // Handle relative imports
  if (importPath.startsWith('./')) {
    const resolved = currentDir ? `${currentDir}/${importPath.slice(2)}` : importPath.slice(2);
    return resolved;
  }
  
  if (importPath.startsWith('../')) {
    const parts = currentDir.split('/');
    let path = importPath;
    
    while (path.startsWith('../')) {
      parts.pop();
      path = path.slice(3);
    }
    
    return parts.length > 0 ? `${parts.join('/')}/${path}` : path;
  }
  
  return importPath;
}

/**
 * Normalize file path for comparison (handle .tsx, .ts extensions)
 */
function normalizeFilePath(path: string): string {
  // Remove extension
  const withoutExt = path.replace(/\.(tsx?|jsx?)$/, '');
  return withoutExt;
}

/**
 * Extract npm package name from import
 * Examples:
 *   'lucide-react' -> 'lucide-react'
 *   '@radix-ui/react-dialog' -> '@radix-ui/react-dialog'
 *   'react/jsx-runtime' -> 'react'
 */
function extractPackageName(importPath: string): string {
  if (importPath.startsWith('@')) {
    // Scoped package: @scope/package
    const parts = importPath.split('/');
    return `${parts[0]}/${parts[1]}`;
  }
  
  // Regular package: package or package/subpath
  return importPath.split('/')[0];
}

/**
 * Validate that all required files are present
 */
export function validateDependencies(graph: DependencyGraph): { valid: boolean; errors: string[] } {
  return {
    valid: graph.errors.length === 0,
    errors: graph.errors,
  };
}

/**
 * Get all files in dependency order (topological sort)
 */
export function getFilesInOrder(graph: DependencyGraph): string[] {
  const visited = new Set<string>();
  const order: string[] = [];
  
  function visit(filePath: string) {
    if (visited.has(filePath)) return;
    visited.add(filePath);
    
    const file = graph.files.get(filePath);
    if (!file) return;
    
    // Visit dependencies first
    for (const dep of file.imports.local) {
      const normalized = normalizeFilePath(dep);
      // Find the actual file path
      for (const [path] of graph.files) {
        if (normalizeFilePath(path) === normalized) {
          visit(path);
          break;
        }
      }
    }
    
    order.push(filePath);
  }
  
  // Visit all files
  for (const [filePath] of graph.files) {
    visit(filePath);
  }
  
  return order;
}
