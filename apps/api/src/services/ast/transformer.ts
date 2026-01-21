import { parse } from '@babel/parser';
import generate from '@babel/generator';
import traverse from '@babel/traverse';

/**
 * Transform TypeScript/TSX code (add missing imports, fix paths, etc.)
 * This is deterministic AST manipulation, NOT AI
 */
export function transformCode(content: string, filename: string): string {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      sourceFilename: filename,
    });

    // You can add transformations here if needed
    // For now, we just parse and regenerate to ensure valid syntax
    
    const output = generate(ast, {
      retainLines: true,
      comments: true,
    }, content);

    return output.code;
  } catch (error) {
    console.error(`Failed to transform ${filename}:`, error);
    return content; // Return original if transformation fails
  }
}

/**
 * Add missing imports to a file
 */
export function addImports(
  content: string,
  filename: string,
  imports: Array<{ source: string; specifiers: string[] }>
): string {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      sourceFilename: filename,
    });

    // Find existing imports
    const existingImports = new Set<string>();
    traverse(ast, {
      ImportDeclaration(path) {
        existingImports.add(path.node.source.value);
      },
    });

    // Generate import statements for missing imports
    const newImports = imports
      .filter(imp => !existingImports.has(imp.source))
      .map(imp => {
        if (imp.specifiers.length === 0) {
          return `import '${imp.source}';`;
        }
        return `import { ${imp.specifiers.join(', ')} } from '${imp.source}';`;
      })
      .join('\n');

    if (newImports) {
      return `${newImports}\n${content}`;
    }

    return content;
  } catch (error) {
    console.error(`Failed to add imports to ${filename}:`, error);
    return content;
  }
}

/**
 * Replace import paths (e.g., convert relative to absolute)
 */
export function replaceImportPaths(
  content: string,
  filename: string,
  replacements: Map<string, string>
): string {
  try {
    const ast = parse(content, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      sourceFilename: filename,
    });

    traverse(ast, {
      ImportDeclaration(path) {
        const oldSource = path.node.source.value;
        const newSource = replacements.get(oldSource);
        
        if (newSource) {
          path.node.source.value = newSource;
        }
      },
    });

    const output = generate(ast, {
      retainLines: true,
      comments: true,
    }, content);

    return output.code;
  } catch (error) {
    console.error(`Failed to replace imports in ${filename}:`, error);
    return content;
  }
}
