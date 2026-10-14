import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import EmptyState from '../common/EmptyState.jsx';
import {
  Sparkles,
  BookOpenText,
  ArrowDown,
  FileQuestion,
  ShieldCheck,
  Upload,
} from 'lucide-react';

const STARTER_QUESTIONS = [
  'What are the four necessary conditions for deadlock?',
  'Explain the TCP Three-Way Handshake step-by-step.',
  'What is the difference between 3NF and BCNF?',
  'Summarize the core theorems from my document.',
];

export default function ChatWindow({
  messages = [],
  sending = false,
  onSend,
  hasReadyDocuments = true,
}) {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const scrollToBottom = (behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, sending]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottom(isUp);
  };

  return (
    <div className="relative flex flex-col h-[740px] max-h-[82vh] bg-white dark:bg-ink-soft rounded-[32px] border border-black/8 dark:border-white/10 shadow-card overflow-hidden">
      {/* Scrollable Messages Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-4"
      >
        {!hasReadyDocuments ? (
          <div className="h-full flex items-center justify-center">
            <EmptyState
              icon={FileQuestion}
              title="No ready documents available"
              description="Please upload and index a study document first so DocuMentor AI can retrieve answers."
              action={
                <Link
                  to="/#upload"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-xs font-bold shadow-md hover:scale-105 transition-transform"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload a Document</span>
                </Link>
              }
            />
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300 flex items-center justify-center mb-4 shadow-sm"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>

            <h3 className="text-2xl font-extrabold text-ink dark:text-white tracking-tight mb-2">
              Ask your documents anything
            </h3>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Every answer is grounded strictly in your study material with verified page-level source
              citations.
            </p>

            <div className="w-full space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Suggested Questions
              </span>
              {STARTER_QUESTIONS.map((q, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => onSend(q)}
                  disabled={sending}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full text-left p-3.5 rounded-full bg-lilac-50/90 dark:bg-black/30 border border-lilac-200/70 dark:border-white/10 hover:border-lilac-400 text-xs text-ink dark:text-slate-200 font-medium transition-all shadow-2xs flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{q}</span>
                  <span className="w-6 h-6 rounded-full bg-white dark:bg-ink text-ink dark:text-white flex items-center justify-center shrink-0 text-xs group-hover:translate-x-1 transition-transform shadow-2xs">
                    →
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}

            {/* Typing indicator with 3 bouncing dots */}
            {sending && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <BookOpenText className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="bg-white dark:bg-[#16161D] border border-black/8 dark:border-white/10 rounded-[28px] rounded-tl-xs px-5 py-4 shadow-card">
                  <div className="flex items-center gap-2.5">
                    <span className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 rounded-full bg-lilac-600 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-lilac-600 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-lilac-600 animate-bounce" />
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">
                      DocuMentor is thinking...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating "Scroll to latest" button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 right-8 z-20 w-10 h-10 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform"
            aria-label="Scroll to newest message"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Bottom Docked Pill Input Bar */}
      <div className="p-4 sm:p-5 bg-white/80 dark:bg-ink-soft/80 border-t border-black/5 dark:border-white/5 backdrop-blur-md">
        <ChatInput onSend={onSend} sending={sending} disabled={!hasReadyDocuments} />
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-3">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Grounded in verified document chunks</span>
          </span>
          <span className="hidden sm:inline">Enter to send • Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
