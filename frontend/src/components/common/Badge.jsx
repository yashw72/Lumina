import React from 'react';

export default function Badge({ status = 'ready', children, className = '' }) {
  const statusStyles = {
    ready:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    processing:
      'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 animate-pulse',
    failed:
      'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800/60',
    lilac:
      'bg-lilac-100 text-lilac-700 dark:bg-lilac-950/70 dark:text-lilac-300 border-lilac-200 dark:border-lilac-800/60',
    orange:
      'bg-orange-50 text-accent-orange dark:bg-orange-950/70 dark:text-orange-300 border-orange-200 dark:border-orange-800/60',
    dark:
      'bg-ink text-white dark:bg-white dark:text-ink border-black/10',
  };

  const dotColors = {
    ready: 'bg-emerald-500',
    processing: 'bg-amber-500',
    failed: 'bg-rose-500',
    lilac: 'bg-lilac-500',
    orange: 'bg-accent-orange',
    dark: 'bg-white',
  };

  const style = statusStyles[status] || statusStyles.ready;
  const dot = dotColors[status] || dotColors.ready;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
      <span>{children || status.charAt(0).toUpperCase() + status.slice(1)}</span>
    </span>
  );
}
