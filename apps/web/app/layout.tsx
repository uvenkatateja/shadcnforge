import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadcnForge - Transform Code into CLI-Installable Components",
  description: "Open-source tool that transforms TSX/MD code into CLI-installable shadcn components",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              ShadcnForge
            </Link>
            <div className="flex gap-6">
              <Link href="/browse" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Browse
              </Link>
              <Link href="/paste" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                Upload
              </Link>
              <a href="https://github.com/yourusername/shadcnforge" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                GitHub
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
