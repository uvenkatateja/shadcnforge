export interface UploadFile {
  path: string;
  content: string;
}

export interface UploadRequest {
  name: string;
  type: 'registry:ui' | 'registry:block' | 'registry:hook';
  files: UploadFile[];
}

export interface UploadResponse {
  success: boolean;
  componentId: string;
  registryUrl: string;
  message?: string;
}
