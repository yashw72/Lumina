import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, BookOpenText, ChevronDown, Layers, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import SourceCard from './SourceCard.jsx';

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);

  const isUser = message.role === 'user';
  const sources = message.sources || [];
  const hasSources = sources.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Answer copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      toast.error('Failed to copy text');
    }
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex justify-end mb-4"
      >
        <div className="bg-ink text-white dark:bg-white dark:text-ink px-5 py-3.5 rounded-[24px] rounded-tr-xs shadow-md max-w-[85%] sm:max-w-[75%] text-xs sm:text-sm font-medium leading-relaxed break-words">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="flex items-start gap-3 mb-6 group"
    >
      {/* Assistant Avatar */}
      <div className="w-8 h-8 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shrink-0 shadow-sm mt-1">
        <BookOpenText className="w-4 h-4 stroke-[2.2]" />
      </div>

      {/* Assistant Message Bubble */}
      <div className="flex-1 bg-white dark:bg-[#16161D] border border-black/8 dark:border-white/10 rounded-[28px] rounded-tl-xs p-5 sm:p-6 shadow-card transition-colors">
        {/* Header & Copy Button */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-ink dark:text-white">DocuMentor AI</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300">
              Grounded RAG
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-ink dark:hover:text-white p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
            aria-label="Copy assistant answer"
            title="Copy answer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[10px] font-semibold">Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Markdown Content */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-ink dark:text-slate-200 leading-relaxed space-y-3">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Sources Section */}
        <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
          {hasSources ? (
            <div>
              <button
                type="button"
                onClick={() => setSourcesOpen(!sourcesOpen)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lilac-100/80 dark:bg-lilac-950/60 border border-lilac-200/80 dark:border-lilac-800/60 text-xs font-bold text-lilac-700 dark:text-lilac-300 hover:bg-lilac-200/70 transition-colors focus:outline-none"
              >
                <FileText className="w-3.5 h-3.5 text-lilac-600 dark:text-lilac-400" />
                <span>Sources ({sources.length})</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    sourcesOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {sourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden mt-3 space-y-2.5"
                  >
                    {sources.map((src, idx) => (
                      <SourceCard key={idx} source={src} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              No matching content found in your documents.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
