'use client';

import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { CrmRecord, SkippedRecord } from '@/services/api';

interface ResultsTableProps {
  imported: CrmRecord[];
  skipped: SkippedRecord[];
}

export default function ResultsTable({ imported, skipped }: ResultsTableProps) {
  const [activeTab, setActiveTab] = useState<'imported' | 'skipped'>('imported');
  const [pageSize, setPageSize] = useState(10);
  const [selectedSkippedRow, setSelectedSkippedRow] = useState<any | null>(null);

  // 1. Column layout for successfully imported CRM leads
  const importedColumns = useMemo(() => {
    const helper = createColumnHelper<CrmRecord>();
    return [
      helper.accessor('name', {
        header: 'Lead Name',
        cell: (info) => info.getValue() || <span className="text-text-muted italic">No Name</span>,
      }),
      helper.accessor('email', {
        header: 'Email',
        cell: (info) => info.getValue() || <span className="text-text-muted">-</span>,
      }),
      helper.accessor('mobile_without_country_code', {
        header: 'Phone',
        cell: (info) => {
          const code = info.row.original.country_code || '';
          const num = info.getValue() || '';
          return num ? `${code} ${num}`.trim() : <span className="text-text-muted">-</span>;
        },
      }),
      helper.accessor('company', {
        header: 'Company',
        cell: (info) => info.getValue() || <span className="text-text-muted">-</span>,
      }),
      helper.accessor('crm_status', {
        header: 'Status',
        cell: (info) => {
          const status = info.getValue();
          const themeMap: Record<string, string> = {
            GOOD_LEAD_FOLLOW_UP: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25',
            DID_NOT_CONNECT: 'bg-amber-500/10 text-amber-500 border-amber-500/25',
            BAD_LEAD: 'bg-rose-500/10 text-rose-500 border-rose-500/25',
            SALE_DONE: 'bg-blue-500/10 text-blue-500 border-blue-500/25',
          };
          return (
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                themeMap[status] || 'bg-surface-secondary text-text-secondary border-brand-border'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </span>
          );
        },
      }),
      helper.accessor('data_source', {
        header: 'Source',
        cell: (info) => {
          const src = info.getValue();
          return src ? (
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-secondary border border-brand-border text-text-secondary">
              {src}
            </span>
          ) : (
            <span className="text-text-muted">-</span>
          );
        },
      }),
      helper.accessor('crm_note', {
        header: 'Extraction Notes',
        cell: (info) => {
          const note = info.getValue();
          return note ? (
            <p className="text-xs text-text-secondary max-w-[240px] truncate" title={note}>
              {note}
            </p>
          ) : (
            <span className="text-text-muted">-</span>
          );
        },
      }),
    ];
  }, []);

  // 2. Column layout for skipped rows
  const skippedColumns = useMemo(() => {
    const helper = createColumnHelper<SkippedRecord>();
    return [
      helper.accessor('reason', {
        header: 'Skip Reason',
        cell: (info) => (
          <span className="text-error font-medium flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            {info.getValue()}
          </span>
        ),
      }),
      helper.accessor('record', {
        header: 'Raw Entry',
        cell: (info) => {
          const raw = info.getValue();
          return (
            <span className="font-mono text-xs text-text-secondary max-w-[400px] block truncate">
              {JSON.stringify(raw)}
            </span>
          );
        },
      }),
      helper.display({
        id: 'inspect',
        header: 'Action',
        cell: (info) => (
          <button
            onClick={() => setSelectedSkippedRow(info.row.original.record)}
            className="p-1.5 rounded-md hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 text-xs"
            title="Inspect full row data"
            id={`inspect-skipped-${info.row.index}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Inspect
          </button>
        ),
      }),
    ];
  }, []);

  const activeData = activeTab === 'imported' ? imported : skipped;
  const activeColumns = activeTab === 'imported' ? (importedColumns as any[]) : (skippedColumns as any[]);

  const table = useReactTable({
    data: activeData as any[],
    columns: activeColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  return (
    <div className="w-full space-y-4" id="results-table-wrapper">
      {/* Tabs Menu */}
      <div className="flex border-b border-brand-border" id="results-tabs">
        <button
          id="tab-imported-btn"
          onClick={() => {
            setActiveTab('imported');
            table.setPageIndex(0);
          }}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'imported'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          Imported Leads
          <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-2xs font-mono border border-brand-border text-text-secondary">
            {imported.length}
          </span>
        </button>
        <button
          id="tab-skipped-btn"
          onClick={() => {
            setActiveTab('skipped');
            table.setPageIndex(0);
          }}
          className={`px-4 py-2.5 font-semibold text-sm border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'skipped'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <AlertTriangle className="h-4 w-4" />
          Skipped / Errors
          <span className="px-2 py-0.5 rounded-full bg-surface-secondary text-2xs font-mono border border-brand-border text-text-secondary">
            {skipped.length}
          </span>
        </button>
      </div>

      {/* Main Table Grid */}
      <div className="relative border border-brand-border rounded-xl bg-surface overflow-hidden shadow-sm">
        <div className="overflow-x-auto overflow-y-auto max-h-[460px] min-h-[160px]">
          {activeData.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-text-muted">
              <p className="text-sm font-semibold">No records in this tab</p>
              <p className="text-xs">No entries match the active criteria list filter.</p>
            </div>
          ) : (
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
                        className="px-4 py-3 text-sm text-text-secondary border-r border-brand-border last:border-r-0"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer Controls */}
      {activeData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <span>Show</span>
            <select
              id="results-page-size-select"
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
              of <span className="font-semibold">{activeData.length}</span> rows
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-text-secondary">
              Page <span className="font-semibold">{table.getState().pagination.pageIndex + 1}</span>{' '}
              of <span className="font-semibold">{table.getPageCount()}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="results-prev-page-btn"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="p-1.5 rounded-lg border border-brand-border bg-surface text-text-secondary disabled:opacity-40 disabled:hover:bg-surface disabled:cursor-not-allowed hover:bg-surface-secondary transition-all"
                aria-label="Previous Page"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                id="results-next-page-btn"
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
      )}

      {/* Inspector Modal for Skipped Records */}
      {selectedSkippedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity"
          onClick={() => setSelectedSkippedRow(null)}
          id="skipped-inspector-modal"
        >
          <div
            className="w-full max-w-xl p-6 rounded-2xl border border-brand-border bg-surface shadow-lg flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-base font-semibold text-text-primary">
                  Inspect Raw Lead Data
                </h4>
                <p className="text-xs text-text-muted mt-0.5">
                  This row failed CRM mapping rules. Raw values:
                </p>
              </div>
              <button
                id="close-modal-btn"
                onClick={() => setSelectedSkippedRow(null)}
                className="p-1.5 rounded-lg hover:bg-surface-secondary text-text-secondary transition-all"
              >
                Close
              </button>
            </div>
            <div className="border border-brand-border rounded-xl bg-surface-secondary/50 p-4 overflow-x-auto">
              <pre className="font-mono text-xs text-text-secondary leading-relaxed">
                {JSON.stringify(selectedSkippedRow, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
