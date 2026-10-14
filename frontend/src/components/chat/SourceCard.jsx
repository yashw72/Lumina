import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);
  const percentage = Math.round((source.score || 0) * 100);

  return (
    <div className="bg-white/80 dark:bg-black/30 border border-lilac-200/70 dark:border-white/10 rounded-2xl p-3 text-xs shadow-2xs transition-all duration-150">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-lilac-100 text-lilac-700 dark:bg-lilac-900/60 dark:text-lilac-300 flex items-center justify-center shrink-0">
            <FileText className="w-3.5 h-3.5" />
          </div>

          <span
            className="font-bold text-ink dark:text-white truncate max-w-[160px] sm:max-w-[240px]"
            title={source.filename}
          >
            {source.filename}
          </span>

          {source.page && (
            <span className="shrink-0 px-2 py-0.5 rounded-full bg-ink text-white dark:bg-white dark:text-ink font-mono font-bold text-[10px]">
              Page {source.page}
            </span>
          )}
        </div>

        {source.score !== undefined && (
          <span
            className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-accent-orange dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200/60 dark:border-orange-800/60"
            title={`Relevance score: ${source.score}`}
          >
            {percentage}% match
          </span>
        )}
      </div>

      {source.snippet && (
        <div className="mt-1.5 pl-1">
          <p
            className={`text-slate-600 dark:text-slate-300 italic font-mono text-[11px] leading-relaxed transition-all ${
              expanded ? '' : 'line-clamp-3'
            }`}
          >
            "{source.snippet}"
          </p>

          {source.snippet.length > 120 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-lilac-600 dark:text-lilac-400 hover:text-lilac-700 focus:outline-none"
            >
              <span>{expanded ? 'Show less' : 'Show more'}</span>
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
