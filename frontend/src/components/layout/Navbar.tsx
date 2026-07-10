'use client';

import ThemeToggle from './ThemeToggle';
import { Database, FileSpreadsheet } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <FileSpreadsheet className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary flex items-center gap-1.5">
              <span>GrowEasy</span>
              <span className="text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                AI Importer
              </span>
            </h1>
            <p className="text-2xs text-text-muted">Production-grade Data Extraction</p>
          </div>
        </div>

        <nav className="flex items-center space-x-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors duration-200"
            id="nav-docs-link"
          >
            Documentation
          </a>
          <div className="h-4 w-px bg-brand-border" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
