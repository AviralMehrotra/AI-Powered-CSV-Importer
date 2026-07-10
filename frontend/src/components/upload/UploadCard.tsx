'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle, FileSpreadsheet, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface UploadCardProps {
  onFileSelect: (file: File) => void;
}

export default function UploadCard({ onFileSelect }: UploadCardProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      setError(null);

      // Handle drop errors
      if (rejectedFiles.length > 0) {
        const rejectReason = rejectedFiles[0];
        if (rejectReason.errors[0]?.code === 'file-invalid-type') {
          setError('Invalid file type. Please upload a CSV file (.csv).');
        } else if (rejectReason.errors[0]?.code === 'file-too-large') {
          setError('File is too large. Max size is 5MB.');
        } else {
          setError(rejectReason.errors[0]?.message || 'Failed to parse file.');
        }
        return;
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  });

  return (
    <div className="w-full max-w-2xl mx-auto" id="upload-card-wrapper">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start space-x-3 text-error"
            id="upload-error-alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{error}</div>
            <button
              onClick={() => setError(null)}
              className="p-1 rounded-md hover:bg-error/10 text-error/80 hover:text-error transition-colors"
              aria-label="Dismiss error"
              id="dismiss-error-btn"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        {...getRootProps()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[320px] ${
          isDragActive
            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
            : 'border-brand-border hover:border-brand-border-hover bg-surface hover:bg-surface-secondary shadow-sm hover:shadow-md'
        }`}
        id="drag-drop-zone"
      >
        <input {...getInputProps()} id="csv-file-input" />

        <motion.div
          animate={{
            scale: isDragActive ? 1.08 : 1,
            y: isDragActive ? -4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-6 shadow-md transition-colors duration-300 ${
            isDragActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface-secondary text-text-secondary group-hover:bg-primary/10 group-hover:text-primary'
          }`}
        >
          {isDragActive ? (
            <UploadCloud className="h-8 w-8 animate-bounce" strokeWidth={1.5} />
          ) : (
            <FileSpreadsheet className="h-8 w-8 transition-transform group-hover:scale-105" strokeWidth={1.5} />
          )}
        </motion.div>

        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {isDragActive ? 'Drop your CSV here' : 'Import your CSV data'}
        </h3>
        
        <p className="text-sm text-text-secondary max-w-sm mb-6">
          Drag and drop your spreadsheet here, or click to browse your local files.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-secondary border border-brand-border text-text-muted">
            CSV only
          </span>
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-surface-secondary border border-brand-border text-text-muted">
            Max 5MB
          </span>
        </div>
      </div>
    </div>
  );
}
