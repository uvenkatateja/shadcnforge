'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface ComponentData {
  id: string;
  name: string;
  type: string;
  registryUrl: string;
  installCount: number;
  createdAt: string;
}

interface FileData {
  path: string;
  content: string;
  fileType: string;
}

export default function ComponentPreviewPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [component, setComponent] = useState<ComponentData | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    Promise.all([
      fetch(`${apiUrl}/r/${id}`).then(r => r.json()),
      fetch(`${apiUrl}/r/${id}/files`).then(r => r.json()),
    ])
      .then(([compData, filesData]) => {
        setComponent(compData);
        setFiles(filesData.files);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const copyInstallCommand = () => {
    if (!component) return;
    const command = `npx shadcn@latest add ${component.registryUrl}`;
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading component...</div>
      </div>
    );
  }

  if (!component) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Component Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            The component you're looking for doesn't exist.
          </p>
          <a
            href="/browse"
            className="inline-block px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Browse Components
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{component.name}</h1>
              <div className="flex items-center gap-3">
                <span className="inline-block px-3 py-1 text-sm rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {component.type}
                </span>
                <span className="text-sm text-slate-500">
                  {component.installCount} installs
                </span>
              </div>
            </div>
          </div>

          {/* Install Command */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 font-mono text-sm">
            <div className="flex items-center justify-between">
              <code className="text-slate-900 dark:text-slate-100">
                npx shadcn@latest add {component.registryUrl}
              </code>
              <button
                onClick={copyInstallCommand}
                className="ml-4 px-3 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded text-xs font-sans hover:opacity-90 transition-opacity"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-3 mt-4">
            <a
              href={component.registryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              View Registry JSON
            </a>
          </div>
        </div>

        {/* Files */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-800 p-4">
            <h2 className="text-xl font-semibold">Files ({files.length})</h2>
          </div>

          {/* File Tabs */}
          <div className="flex items-center gap-2 p-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {files.map((file, index) => (
              <button
                key={index}
                onClick={() => setActiveFileIndex(index)}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors shrink-0 ${
                  activeFileIndex === index
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {file.path}
              </button>
            ))}
          </div>

          {/* File Content */}
          <div className="p-6">
            <pre className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-slate-900 dark:text-slate-100">
                {files[activeFileIndex]?.content}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
