'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ArrowLeft, ArrowRight, Check, X, FileSpreadsheet } from 'lucide-react';

interface CSVPreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CSVPreviewTable({
  headers,
  rows,
  fileName,
  onConfirm,
  onCancel,
}: CSVPreviewTableProps) {
  const [pageSize, setPageSize] = useState(10);

  // Dynamically compile columns based on CSV headers
  const columns = useMemo(() => {
    const helper = createColumnHelper<Record<string, string>>();
    return headers.map((header) =>
      helper.accessor(header, {
        header: header || '(Blank Header)',
        cell: (info) => {
          const value = info.getValue();
          return value !== undefined && value !== null ? (
            <span className="truncate max-w-[200px] block" title={value}>
              {value}
            </span>
          ) : (
            <span className="text-text-muted italic">empty</span>
          );
        },
      })
    );
  }, [headers]);

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="w-full space-y-6" id="csv-preview-table-container">
      {/* Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-brand-border bg-surface shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-text-primary truncate max-w-[250px] sm:max-w-md">
              {fileName}
            </h4>
            <p className="text-xs text-text-secondary">
              Successfully parsed <span className="font-mono font-semibold">{rows.length}</span> rows and{' '}
              <span className="font-mono font-semibold">{headers.length}</span> columns locally.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="cancel-preview-btn"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-brand-border text-sm font-medium hover:bg-surface-secondary text-text-secondary transition-all"
          >
            <span className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancel
            </span>
          </button>
          <button
            id="confirm-import-btn"
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary-hover shadow-sm transition-all flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Confirm Import
          </button>
        </div>
      </div>

      {/* Main Table Wrapper */}
      <div className="relative border border-brand-border rounded-xl bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[420px] min-h-[200px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-surface-secondary border-b border-brand-border z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-xs font-semibold tracking-wider text-text-secondary uppercase select-none border-r border-brand-border last:border-r-0"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-brand-border">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-surface-secondary/40 transition-colors duration-150"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 text-sm text-text-secondary font-mono border-r border-brand-border last:border-r-0"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <span>Show</span>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => {
              const val = Number(e.target.value);
              setPageSize(val);
              table.setPageSize(val);
            }}
            className="px-2 py-1 rounded bg-surface border border-brand-border focus:outline-none focus:ring-1 focus:ring-primary text-sm font-medium"
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size} rows
              </option>
            ))}
          </select>
          <span>
            of <span className="font-semibold">{rows.length}</span> rows
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-text-secondary">
            Page <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span> of{' '}
            <span className="font-semibold">{table.getPageCount()}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              id="prev-page-btn"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-brand-border bg-surface text-text-secondary disabled:opacity-40 disabled:hover:bg-surface disabled:cursor-not-allowed hover:bg-surface-secondary transition-all"
              aria-label="Previous Page"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              id="next-page-btn"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-brand-border bg-surface text-text-secondary disabled:opacity-40 disabled:hover:bg-surface disabled:cursor-not-allowed hover:bg-surface-secondary transition-all"
              aria-label="Next Page"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
