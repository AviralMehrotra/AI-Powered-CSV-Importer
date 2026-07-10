'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, RotateCcw, Upload, Eye, CheckCircle2, ChevronRight } from 'lucide-react';
import UploadCard from '@/components/upload/UploadCard';
import CSVPreviewTable from '@/components/preview/CSVPreviewTable';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import ImportStats from '@/components/results/ImportStats';
import ResultsTable from '@/components/results/ResultsTable';
import { importCsvFile, ImportResponse } from '@/services/api';

type Step = 'upload' | 'preview' | 'importing' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local CSV parsing handler
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];

        if (rows.length === 0) {
          setError('The uploaded CSV file does not contain any valid data rows.');
          setFile(null);
          return;
        }

        setParsedHeaders(headers.map((h) => h.trim()));
        setParsedRows(rows);
        setStep('preview');
      },
      error: (err) => {
        setError(`Failed to parse file: ${err.message}`);
        setFile(null);
      },
    });
  };

  // Backend upload and Gemini AI processing execution
  const handleConfirmImport = async () => {
    if (!file) return;

    setStep('importing');
    setError(null);

    try {
      const result = await importCsvFile(file);
      setImportResult(result);
      setStep('results');
    } catch (err: any) {
      let errMsg = 'Failed to connect to the backend import service.';
      if (err.response?.data?.error?.message) {
        errMsg = err.response.data.error.message;
      } else if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
      setStep('preview'); // return to preview so the user can try again
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedHeaders([]);
    setParsedRows([]);
    setImportResult(null);
    setError(null);
    setStep('upload');
  };

  // Steps indicator navigation mapping
  const stepsConfig = [
    { id: 'upload', label: 'Upload CSV', icon: Upload },
    { id: 'preview', label: 'Preview Headers', icon: Eye },
    { id: 'results', label: 'Import Results', icon: CheckCircle2 },
  ];

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-start space-y-8" id="dashboard-container">
      {/* 1. Page Header Titles */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
          AI-Powered CRM Lead Importer
        </h2>
        <p className="text-sm text-text-secondary max-w-xl mx-auto">
          Upload any CSV lead spreadsheet regardless of formatting. Our engine uses Google Gemini
          to intelligently parse, structure, and import clean CRM records.
        </p>
      </div>

      {/* 2. Visual Steps Indicator Bar */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-4 bg-surface px-6 py-3.5 rounded-2xl border border-brand-border shadow-sm w-full max-w-2xl" id="stepper-bar">
        {stepsConfig.map((item, index) => {
          const Icon = item.icon;
          const isActive = step === item.id || (step === 'importing' && item.id === 'preview');
          const isCompleted =
            (step === 'preview' && index === 0) ||
            (step === 'results' && index < 2) ||
            (step === 'importing' && index === 0);

          return (
            <div key={item.id} className="flex items-center space-x-2">
              {index > 0 && <ChevronRight className="h-4 w-4 text-text-muted" />}
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm shadow-primary/5'
                    : isCompleted
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-transparent text-text-muted border-transparent'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Global Dashboard Stage Content Switcher */}
      <div className="w-full" id="stage-content-wrapper">
        {error && step === 'preview' && (
          <div
            className="max-w-2xl mx-auto mb-6 p-4 rounded-xl bg-error/10 border border-error/20 flex items-start space-x-3 text-error"
            id="stage-error-alert"
          >
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h5 className="text-sm font-bold">Import Processing Error</h5>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UploadCard onFileSelect={handleFileSelect} />
            </motion.div>
          )}

          {step === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <CSVPreviewTable
                headers={parsedHeaders}
                rows={parsedRows}
                fileName={file?.name || 'spreadsheet.csv'}
                onConfirm={handleConfirmImport}
                onCancel={handleReset}
              />
            </motion.div>
          )}

          {step === 'results' && importResult && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Reset button to start over */}
              <div className="flex justify-end">
                <button
                  id="reset-import-btn"
                  onClick={handleReset}
                  className="px-4 py-2 bg-surface hover:bg-surface-secondary border border-brand-border text-text-secondary hover:text-text-primary rounded-lg text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  Import Another File
                </button>
              </div>

              {/* Stats overview cards */}
              <ImportStats summary={importResult.summary} />

              {/* CRM leads grid & skipped errors logs */}
              <ResultsTable imported={importResult.imported} skipped={importResult.skipped} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Concurrency Loader Overlay */}
      {step === 'importing' && <LoadingOverlay />}
    </div>
  );
}
