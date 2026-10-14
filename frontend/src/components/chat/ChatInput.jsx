import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, Loader2 } from 'lucide-react';

const MAX_CHARS = 2000;

export default function ChatInput({ onSend, sending = false, disabled = false }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height as user types up to 5 lines (~130px)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    onSend(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end gap-2 bg-white dark:bg-ink-soft border border-black/10 dark:border-white/10 rounded-full pl-5 pr-2.5 py-2 shadow-card focus-within:border-lilac-500 focus-within:ring-4 focus-within:ring-lilac-400/20 transition-all duration-200"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        maxLength={MAX_CHARS}
        value={text}
        disabled={disabled || sending}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? 'Select a ready document to start chatting...'
            : 'Ask a question about your study documents...'
        }
        className="flex-1 max-h-36 min-h-[38px] resize-none border-0 bg-transparent py-2 text-xs sm:text-sm text-ink dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-0 leading-relaxed"
      />

      {/* Character Counter near limit */}
      {text.length >= 1500 && (
        <span
          className={`text-[10px] font-mono self-center shrink-0 pr-1 ${
            text.length >= 1950 ? 'text-rose-500 font-bold' : 'text-slate-400'
          }`}
        >
          {text.length}/{MAX_CHARS}
        </span>
      )}

      {/* Black Round Send Button */}
      <div className="flex items-center shrink-0 pb-0.5">
        <motion.button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          whileHover={!text.trim() || sending || disabled ? {} : { scale: 1.08 }}
          whileTap={!text.trim() || sending || disabled ? {} : { scale: 0.92 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            text.trim() && !sending && !disabled
              ? 'bg-ink text-white dark:bg-white dark:text-ink shadow-md cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
          aria-label="Send message"
          title="Send message (Enter)"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          )}
        </motion.button>
      </div>
    </form>
  );
}
