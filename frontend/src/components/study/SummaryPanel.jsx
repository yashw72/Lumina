import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Sparkles, RotateCcw, FileText, BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button.jsx';

export default function SummaryPanel({
  summary,
  loading = false,
  onGenerate,
  disabled = false,
  documentTitle = 'this document',
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      toast.success('Summary copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      toast.error('Failed to copy summary');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Generating AI Study Summary...
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed animate-pulse">
          Analyzing document chunks, extracting key concepts, theorems, and exam takeaways. This can
          take 10-20 seconds.
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
          <FileText className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Document Summary
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Create an executive summary of <span className="font-semibold text-slate-700 dark:text-slate-300">"{documentTitle}"</span>, structured into key concepts, critical theorems, and recommended exam review points.
        </p>
        <Button
          variant="primary"
          size="lg"
          icon={Sparkles}
          disabled={disabled}
          onClick={onGenerate}
        >
          Generate Summary
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Executive Study Summary
            </h3>
            <p className="text-[11px] text-slate-400">
              Grounded exclusively in {documentTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={onGenerate}
          >
            Regenerate
          </Button>
        </div>
      </div>

      {/* Markdown Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed">
        <ReactMarkdown>{summary}</ReactMarkdown>
      </div>
    </div>
  );
}
