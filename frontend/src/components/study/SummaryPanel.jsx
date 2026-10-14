import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  BookOpenText,
  FileText,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../common/Button.jsx';
import Card from '../common/Card.jsx';

const LOADING_MESSAGES = [
  'Reading your document passages...',
  'Extracting core concepts and theorems...',
  'Synthesizing exam-ready takeaways...',
  'Formatting structured study notes...',
  'Almost ready...',
];

export default function SummaryPanel({
  summary,
  loading = false,
  onGenerate,
  disabled = false,
  documentTitle = 'this document',
}) {
  const [copied, setCopied] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);

  // Rotate friendly loading messages every 3s
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

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
      <Card variant="lilac" className="py-20 text-center max-w-xl mx-auto shadow-card">
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 rounded-full bg-white dark:bg-ink text-lilac-600 dark:text-lilac-400 flex items-center justify-center shadow-md"
          >
            <Sparkles className="w-8 h-8" />
          </motion.div>

          <h3 className="text-xl font-extrabold text-ink dark:text-white">
            Generating Executive Summary
          </h3>

          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium h-6"
            >
              {LOADING_MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>

          <div className="w-48 h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-lilac-600 rounded-full shimmer w-full" />
          </div>
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card variant="white" className="py-16 text-center max-w-xl mx-auto space-y-5">
        <div className="w-16 h-16 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300 mx-auto flex items-center justify-center shadow-sm">
          <FileText className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-ink dark:text-white">
            Executive Document Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Extract the core objectives, key theorems, and recommended exam review points from{' '}
            <strong className="text-ink dark:text-white font-bold">"{documentTitle}"</strong>.
          </p>
        </div>

        <div className="pt-2">
          <Button
            variant="primary"
            size="lg"
            disabled={disabled}
            onClick={onGenerate}
          >
            Generate Summary
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white dark:bg-ink-soft rounded-card border border-black/8 dark:border-white/10 shadow-card overflow-hidden"
    >
      {/* Decorative Lilac Top Header Strip */}
      <div className="h-2.5 w-full bg-gradient-to-r from-lilac-400 via-lilac-600 to-accent-orange" />

      <div className="p-6 sm:p-8 space-y-6">
        {/* Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lilac-100 dark:bg-lilac-950 text-lilac-700 dark:text-lilac-300 flex items-center justify-center shadow-2xs">
              <BookOpenText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ink dark:text-white">
                Executive Study Summary
              </h3>
              <p className="text-xs text-slate-400">Grounded exclusively in {documentTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              hideArrow
              icon={copied ? Check : Copy}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              hideArrow
              icon={RotateCcw}
              onClick={onGenerate}
            >
              Regenerate
            </Button>
          </div>
        </div>

        {/* Styled Markdown Typography Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-ink dark:text-slate-200 leading-relaxed space-y-4 prose-headings:font-extrabold prose-headings:text-ink dark:prose-headings:text-white prose-h2:border-l-4 prose-h2:border-lilac-600 prose-h2:pl-3 prose-h3:border-l-2 prose-h3:border-lilac-400 prose-h3:pl-2.5 prose-ul:space-y-1.5 prose-li:marker:text-lilac-600 prose-blockquote:rounded-2xl prose-blockquote:bg-lilac-50 dark:prose-blockquote:bg-lilac-950/40 prose-blockquote:border-lilac-400 prose-blockquote:p-4">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
}
