export interface Component {
  id: string;
  name: string;
  type: 'registry:ui' | 'registry:block' | 'registry:hook';
  registryUrl: string;
  blobUrls: string[];
  installCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ComponentFile {
  id: string;
  componentId: string;
  path: string;
  content: string;
  fileType: 'tsx' | 'ts' | 'css' | 'json';
  order: number;
  createdAt: Date;
}

export interface ComponentDependency {
  id: string;
  fileId: string;
  importPath: string;
  resolved: boolean;
  targetFileId: string | null;
  createdAt: Date;
}
