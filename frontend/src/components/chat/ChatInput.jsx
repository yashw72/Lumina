import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowUp, Loader2 } from 'lucide-react';
import Button from '../common/Button.jsx';

export default function ChatInput({ onSend, sending = false, disabled = false }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
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
      className="relative flex items-end gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-150"
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={text}
        disabled={disabled || sending}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? 'Select at least one ready document to start chatting...'
            : 'Ask a question about your study documents... (Enter to send)'
        }
        className="flex-1 max-h-40 min-h-[40px] resize-none border-0 bg-transparent py-2 px-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-0 leading-relaxed"
      />

      <div className="flex items-center gap-1.5 shrink-0 pb-1 pr-1">
        <button
          type="submit"
          disabled={!text.trim() || sending || disabled}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
            text.trim() && !sending && !disabled
              ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm shadow-indigo-500/30 cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
          title="Send message (Enter)"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          )}
        </button>
      </div>
    </form>
  );
}
