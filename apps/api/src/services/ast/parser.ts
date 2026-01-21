import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { ParseResult } from '@babel/parser';

export interface ImportInfo {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  isNamespace: boolean;
}

export interface DependencyInfo {
  imports: ImportInfo[];
  exports: string[];
}

/**
 * Parse TypeScript/TSX file and extract import/export information
 * This is NOT AI - it's a deterministic compiler-based parser
 */
export function parseFile(content: string, filename: string): DependencyInfo {
  const imports: ImportInfo[] = [];
  const exports: string[] = [];

  try {
    const ast: ParseResult<any> = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      sourceFilename: filename,
    });

    traverse(ast, {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers: string[] = [];
        let isDefault = false;
        let isNamespace = false;

        path.node.specifiers.forEach((spec) => {
          if (spec.type === 'ImportDefaultSpecifier') {
            isDefault = true;
            specifiers.push(spec.local.name);
          } else if (spec.type === 'ImportNamespaceSpecifier') {
            isNamespace = true;
            specifiers.push(spec.local.name);
          } else if (spec.type === 'ImportSpecifier') {
            specifiers.push(spec.imported.type === 'Identifier' ? spec.imported.name : spec.imported.value);
          }
        });

        imports.push({ source, specifiers, isDefault, isNamespace });
      },

      ExportNamedDeclaration(path) {
        if (path.node.declaration) {
          if (path.node.declaration.type === 'VariableDeclaration') {
            path.node.declaration.declarations.forEach((decl) => {
              if (decl.id.type === 'Identifier') {
                exports.push(decl.id.name);
              }
            });
          } else if (
            path.node.declaration.type === 'FunctionDeclaration' ||
            path.node.declaration.type === 'ClassDeclaration'
          ) {
            if (path.node.declaration.id) {
              exports.push(path.node.declaration.id.name);
            }
          }
        }
      },

      ExportDefaultDeclaration() {
        exports.push('default');
      },
    });

    return { imports, exports };
  } catch (error) {
    console.error(`Failed to parse ${filename}:`, error);
    return { imports: [], exports: [] };
  }
}

/**
 * Check if an import path is a local component (starts with @/ or ./)
 */
export function isLocalImport(importPath: string): boolean {
  return importPath.startsWith('@/') || importPath.startsWith('./') || importPath.startsWith('../');
}

/**
 * Check if an import path is a shadcn UI component
 */
export function isShadcnComponent(importPath: string): boolean {
  return importPath.startsWith('@/components/ui/');
}

/**
 * Extract component name from import path
 * Example: "@/components/ui/button" -> "button"
 */
export function extractComponentName(importPath: string): string | null {
  const match = importPath.match(/@\/components\/ui\/(.+)/);
  return match ? match[1] : null;
}
