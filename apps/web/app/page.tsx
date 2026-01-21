export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400">
          ShadcnForge
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
          Transform TSX/MD code into CLI-installable shadcn components
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <a
            href="/paste"
            className="px-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </a>
          <a
            href="https://github.com/yourusername/shadcnforge"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border border-slate-300 dark:border-slate-700 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
