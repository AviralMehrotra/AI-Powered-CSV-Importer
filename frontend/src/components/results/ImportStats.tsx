'use client';

import { CheckCircle2, XCircle, BarChart3, Clock } from 'lucide-react';
import { SummaryStats } from '@/services/api';

interface ImportStatsProps {
  summary: SummaryStats;
}

export default function ImportStats({ summary }: ImportStatsProps) {
  const successRate =
    summary.total > 0
      ? ((summary.importedCount / summary.total) * 100).toFixed(1)
      : '0.0';

  const durationSec = (summary.durationMs / 1000).toFixed(2);

  const cards = [
    {
      id: 'stat-total',
      title: 'Total Rows',
      value: summary.total,
      description: 'Records in CSV file',
      icon: BarChart3,
      color: 'text-text-primary bg-surface-secondary',
    },
    {
      id: 'stat-imported',
      title: 'Imported Successfully',
      value: summary.importedCount,
      description: `${successRate}% success rate`,
      icon: CheckCircle2,
      color: 'text-success bg-success/10 border border-success/20',
    },
    {
      id: 'stat-skipped',
      title: 'Skipped Rows',
      value: summary.skippedCount,
      description: 'Failed schema validations',
      icon: XCircle,
      color: summary.skippedCount > 0 
        ? 'text-error bg-error/10 border border-error/20'
        : 'text-text-muted bg-surface-secondary',
    },
    {
      id: 'stat-duration',
      title: 'Processing Time',
      value: `${durationSec}s`,
      description: 'Gemini extraction duration',
      icon: Clock,
      color: 'text-info bg-info/10 border border-info/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="import-stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={card.id}
            className="p-5 rounded-2xl bg-surface border border-brand-border shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.color.split(' ').slice(1).join(' ')}`}>
                <Icon className={`h-4 w-4 ${card.color.split(' ')[0]}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-text-primary tracking-tight">
                {card.value}
              </div>
              <p className="text-xs text-text-secondary mt-1">{card.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
