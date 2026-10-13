import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, BookOpen, Percent } from 'lucide-react';

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  const percentage = Math.round((source.score || 0) * 100);

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 rounded-xl p-3 text-xs transition-all duration-150 hover:border-indigo-300 dark:hover:border-indigo-500/50">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span
            className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-[240px]"
            title={source.filename}
          >
            {source.filename}
          </span>
          {source.page && (
            <span className="shrink-0 px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[10px]">
              Page {source.page}
            </span>
          )}
        </div>

        {source.score !== undefined && (
          <span
            className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full font-semibold text-[10px] bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
            title={`Relevance score: ${source.score}`}
          >
            {percentage}% match
          </span>
        )}
      </div>

      {source.snippet && (
        <div className="mt-1">
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
              className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 focus:outline-none"
            >
              {expanded ? (
                <>
                  <span>Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span>Read snippet</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
