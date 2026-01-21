'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function PastePage() {
  const [componentName, setComponentName] = useState('');
  const [componentType, setComponentType] = useState<'registry:ui' | 'registry:block' | 'registry:hook'>('registry:ui');
  const [files, setFiles] = useState([{ path: 'component.tsx', content: '' }]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleAddFile = () => {
    setFiles([...files, { path: `file-${files.length + 1}.tsx`, content: '' }]);
  };

  const handleRemoveFile = (index: number) => {
    if (files.length > 1) {
      setFiles(files.filter((_, i) => i !== index));
      if (activeFileIndex >= files.length - 1) {
        setActiveFileIndex(Math.max(0, files.length - 2));
      }
    }
  };

  const handleFilePathChange = (index: number, newPath: string) => {
    const newFiles = [...files];
    newFiles[index].path = newPath;
    setFiles(newFiles);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      const newFiles = [...files];
      newFiles[activeFileIndex].content = value;
      setFiles(newFiles);
    }
  };

  const handleSubmit = async () => {
    if (!componentName || files.some(f => !f.content.trim())) {
      setResult({ success: false, message: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: componentName,
          type: componentType,
          files,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ 
          success: true, 
          message: `Component uploaded! Registry URL: ${data.component.registryUrl}` 
        });
        // Reset form
        setComponentName('');
        setFiles([{ path: 'component.tsx', content: '' }]);
        setActiveFileIndex(0);
      } else {
        setResult({ success: false, message: data.message || 'Upload failed' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error. Is the API running?' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Paste Your Component</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Transform your TSX code into a CLI-installable shadcn component
          </p>
        </div>

        {/* Component Metadata */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Component Name</label>
            <input
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="my-awesome-button"
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <p className="text-xs text-slate-500 mt-1">Use lowercase letters, numbers, and hyphens only</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Component Type</label>
            <select
              value={componentType}
              onChange={(e) => setComponentType(e.target.value as any)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="registry:ui">UI Component</option>
              <option value="registry:block">Block</option>
              <option value="registry:hook">Hook</option>
            </select>
          </div>
        </div>

        {/* File Tabs */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center gap-2 p-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setActiveFileIndex(index)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    activeFileIndex === index
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {file.path}
                </button>
                {files.length > 1 && (
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="text-slate-400 hover:text-red-500 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddFile}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
            >
              + Add File
            </button>
          </div>

          {/* File Path Editor */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <input
              type="text"
              value={files[activeFileIndex].path}
              onChange={(e) => handleFilePathChange(activeFileIndex, e.target.value)}
              placeholder="components/ui/button.tsx"
              className="w-full px-3 py-1.5 text-sm border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Monaco Editor */}
          <div className="h-[500px]">
            <Editor
              height="100%"
              defaultLanguage="typescript"
              theme="vs-dark"
              value={files[activeFileIndex].content}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !componentName}
            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Uploading...' : 'Generate Registry'}
          </button>

          {result && (
            <div className={`px-4 py-2 rounded-lg ${
              result.success 
                ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' 
                : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
            }`}>
              {result.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
