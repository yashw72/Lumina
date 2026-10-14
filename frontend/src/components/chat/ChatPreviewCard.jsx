import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpenText, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

const FULL_TEXT =
  'A deadlock occurs when a set of concurrent processes are permanently blocked because each process holds a resource and waits for another resource held by another process.';

export default function ChatPreviewCard() {
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let index = 0;
    let timer;
    let resetTimer;

    const typeNextChar = () => {
      if (index < FULL_TEXT.length) {
        setTypedText(FULL_TEXT.substring(0, index + 1));
        index++;
        timer = setTimeout(typeNextChar, 35);
      } else {
        setIsTyping(false);
        resetTimer = setTimeout(() => {
          setTypedText('');
          index = 0;
          setIsTyping(true);
          timer = setTimeout(typeNextChar, 500);
        }, 6000);
      }
    };

    timer = setTimeout(typeNextChar, 800);

    return () => {
      clearTimeout(timer);
      clearTimeout(resetTimer);
    };
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto" aria-hidden="true">
      {/* Outer Floating Card */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="bg-white dark:bg-[#1A1A22] text-ink dark:text-white rounded-[28px] p-5 sm:p-6 shadow-2xl border border-white/40 dark:border-white/10 space-y-4"
      >
        {/* Card Header */}
        <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">Live RAG Retrieval</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            Interactive Example
          </span>
        </div>

        {/* User Question Bubble */}
        <div className="flex justify-end">
          <div className="bg-ink text-white dark:bg-white dark:text-ink text-xs sm:text-sm font-medium px-4 py-2.5 rounded-full shadow-sm max-w-[85%]">
            What is a deadlock?
          </div>
        </div>

        {/* Assistant Response Bubble */}
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-900/80 dark:text-lilac-200 flex items-center justify-center shrink-0 mt-1">
            <BookOpenText className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="bg-slate-50 dark:bg-black/30 border border-black/5 dark:border-white/5 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed min-h-[76px] flex-1">
            <span>{typedText}</span>
            {isTyping && (
              <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-lilac-600 animate-pulse align-middle" />
            )}
          </div>
        </div>

        {/* Floating Citation Chip */}
        <div className="pt-1">
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/80 dark:border-orange-800/60 text-accent-orange dark:text-orange-300 text-[11px] font-bold shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>os-notes.pdf</span>
            <span className="text-slate-400">•</span>
            <span>Page 4</span>
            <span className="text-slate-400">•</span>
            <span className="px-1.5 py-0.2 rounded-md bg-accent-orange text-white text-[10px]">
              82% match
            </span>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
