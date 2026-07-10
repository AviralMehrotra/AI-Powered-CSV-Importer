'use client';

import { motion } from 'framer-motion';
import { Loader2, Sparkles, BrainCircuit } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LoadingOverlay() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/85 backdrop-blur-md"
      id="loading-overlay"
    >
      <div className="max-w-md w-full p-8 text-center flex flex-col items-center gap-6">
        {/* Animated Brain/Sparkles Ring */}
        <div className="relative">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="h-24 w-24 rounded-full border-2 border-dashed border-primary/45 flex items-center justify-center"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5">
              <BrainCircuit className="h-8 w-8 text-primary animate-pulse" strokeWidth={1.5} />
            </div>
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -top-1 -right-1 p-1 bg-surface border border-brand-border rounded-lg shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-accent" />
          </motion.div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-text-primary flex items-center justify-center gap-1">
            <span>Extracting CRM Fields</span>
            <span className="font-mono inline-block w-6 text-left">{dots}</span>
          </h3>
          <p className="text-sm text-text-secondary max-w-xs mx-auto">
            Google Gemini is mapping column structures and processing data batches. Please wait...
          </p>
        </div>

        {/* Progress Spinner */}
        <div className="flex items-center space-x-2 text-xs font-mono text-text-muted bg-surface-secondary px-3 py-1.5 rounded-lg border border-brand-border mt-2">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span>Batch processing in queue</span>
        </div>
      </div>
    </div>
  );
}
