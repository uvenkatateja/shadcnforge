'use client';

import { useEffect, useState } from 'react';

interface Component {
  name: string;
  type: string;
  registryUrl: string;
  installCount: number;
}

export default function BrowsePage() {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedName, setCopiedName] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/registry`)
      .then((res) => res.json())
      .then((data) => {
        setComponents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyInstallCommand = (name: string) => {
    navigator.clipboard.writeText(`npx shadcn@latest add ${name}`);
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 dark:text-slate-400">Loading components...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Components</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Discover and install community-created shadcn components
          </p>
        </div>

        {components.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 mb-4">No components yet</p>
            <a
              href="/paste"
              className="inline-block px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upload First Component
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {components.map((component) => (
              <div
                key={component.name}
                className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">{component.name}</h3>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {component.type}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    {component.installCount} installs
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => copyInstallCommand(component.name)}
                    className="w-full px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                  >
                    {copiedName === component.name ? '✓ Copied!' : 'Copy Install Command'}
                  </button>
                  <a
                    href={component.registryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-center text-sm"
                  >
                    View Registry JSON
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
