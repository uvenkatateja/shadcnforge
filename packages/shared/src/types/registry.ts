export interface RegistryFile {
  path: string;
  content: string;
  type: 'registry:ui' | 'registry:block' | 'registry:hook';
  target?: string;
}

export interface RegistryItem {
  name: string;
  type: 'registry:ui' | 'registry:block' | 'registry:hook';
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFile[];
  tailwind?: {
    config?: Record<string, any>;
  };
  cssVars?: Record<string, Record<string, string>>;
}

export interface RegistryIndex {
  name: string;
  type: 'registry:ui' | 'registry:block' | 'registry:hook';
  description?: string;
  dependencies?: string[];
  devDependencies?: string[];
  registryDependencies?: string[];
  files: string[];
}
