import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, Sparkles, ChevronDown, ChevronUp, Layers, User } from 'lucide-react';
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
      <div className="flex justify-end mb-4 animate-in fade-in duration-200">
        <div className="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%] flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <div className="bg-indigo-600 text-white px-4 py-3 rounded-2xl rounded-tr-xs shadow-sm text-sm sm:text-base leading-relaxed break-words">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6 animate-in fade-in duration-200">
      <div className="flex items-start gap-3 max-w-[95%] sm:max-w-[85%]">
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Assistant Message Container */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-xs transition-colors">
          {/* Header with model name and Copy Button */}
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>DocuMentor AI</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400 font-mono">
                RAG Answer
              </span>
            </span>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 p-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none"
              title="Copy answer"
              aria-label="Copy answer text"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Markdown Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed break-words space-y-3">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>

          {/* Sources Section */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            {hasSources ? (
              <div>
                <button
                  type="button"
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors focus:outline-none"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>
                    Sources ({sources.length})
                  </span>
                  {sourcesOpen ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {sourcesOpen && (
                  <div className="mt-3 space-y-2.5 animate-in fade-in duration-150">
                    {sources.map((src, idx) => (
                      <SourceCard key={idx} source={src} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                No matching content found in your documents.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
