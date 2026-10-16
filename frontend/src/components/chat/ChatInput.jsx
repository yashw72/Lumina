import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, Loader2, Image as ImageIcon, Sparkles, X, Wand2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MAX_CHARS = 2000;

const SUGGESTIONS = [
  { label: '🎨 Draw Diagram', prompt: 'Draw a clear educational diagram illustrating ' },
  { label: '📊 System Architecture', prompt: 'Create an architecture diagram showing the components of ' },
  { label: '🔄 Flowchart', prompt: 'Generate a flowchart diagram explaining the process of ' },
];

export default function ChatInput({ onSend, sending = false, disabled = false }) {
  const [text, setText] = useState('');
  const [isImageMode, setIsImageMode] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea height as user types up to ~140px
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

    let promptToSend = trimmed;
    let shouldBeImage = isImageMode;

    // Check for /image shorthand command
    if (promptToSend.startsWith('/image')) {
      shouldBeImage = true;
      promptToSend = promptToSend.replace(/^\/image\s*/i, '').trim();
    }

    const lower = promptToSend.toLowerCase();
    const incompletePrefixes = [
      'draw a clear educational diagram illustrating',
      'create an architecture diagram showing the components of',
      'generate a flowchart diagram explaining the process of',
    ];
    if (
      incompletePrefixes.includes(lower) ||
      lower.endsWith('illustrating') ||
      lower.endsWith('components of') ||
      lower.endsWith('process of')
    ) {
      toast.error('Please complete the prompt with the specific topic you want to visualize.');
      textareaRef.current?.focus();
      return;
    }

    onSend(promptToSend, { isImage: shouldBeImage });
    setText('');
    setIsImageMode(false);
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

  const handleSuggestionClick = (promptPrefix) => {
    setIsImageMode(true);
    setText(promptPrefix);
    textareaRef.current?.focus();
  };

  return (
    <div className="space-y-2">
      {/* Suggestions / Mode Indicator Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <AnimatePresence mode="wait">
          {isImageMode ? (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-lilac-600 to-purple-600 text-white text-[11px] font-bold shadow-sm"
            >
              <Sparkles className="w-3 h-3 text-lilac-200" />
              <span>Image / Diagram Mode Enabled</span>
              <button
                type="button"
                onClick={() => setIsImageMode(false)}
                className="ml-1 p-0.5 hover:bg-white/20 rounded-full transition-colors"
                title="Disable image mode"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-0.5 hidden sm:inline">
                Quick visuals:
              </span>
              {SUGGESTIONS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={disabled || sending}
                  onClick={() => handleSuggestionClick(item.prompt)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-black/5 dark:bg-white/5 hover:bg-lilac-100 dark:hover:bg-lilac-950/60 text-slate-600 dark:text-slate-300 hover:text-lilac-700 dark:hover:text-lilac-300 border border-transparent hover:border-lilac-300 transition-all"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* Shorthand tip */}
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono hidden md:inline ml-auto">
          Tip: type <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/5">/image &lt;topic&gt;</code> to visualize
        </span>
      </div>

      {/* Main Pill Input */}
      <form
        onSubmit={handleSubmit}
        className={`relative flex items-end gap-2 bg-white dark:bg-ink-soft border rounded-full pl-3 sm:pl-4 pr-2.5 py-1.5 shadow-card transition-all duration-200 ${
          isImageMode
            ? 'border-lilac-500 ring-4 ring-lilac-400/25 dark:border-lilac-400'
            : 'border-black/10 dark:border-white/10 focus-within:border-lilac-500 focus-within:ring-4 focus-within:ring-lilac-400/20'
        }`}
      >
        {/* Visual Diagram Mode Toggle Button */}
        <motion.button
          type="button"
          disabled={disabled || sending}
          onClick={() => setIsImageMode((prev) => !prev)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isImageMode
              ? 'bg-lilac-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-lilac-600 dark:hover:text-lilac-300 hover:bg-lilac-50 dark:hover:bg-lilac-950/50'
          }`}
          title={isImageMode ? 'Image mode is ON (click to switch to normal chat)' : 'Switch to Image / Diagram generation mode'}
          aria-label="Toggle diagram generation mode"
        >
          <ImageIcon className="w-4 h-4" />
        </motion.button>

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
              : isImageMode
              ? 'Describe the diagram or concept you want to visualize...'
              : 'Ask a question or request a diagram from your study documents...'
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

        {/* Send / Generate Button */}
        <div className="flex items-center shrink-0 pb-0.5">
          <motion.button
            type="submit"
            disabled={!text.trim() || sending || disabled}
            whileHover={!text.trim() || sending || disabled ? {} : { scale: 1.08 }}
            whileTap={!text.trim() || sending || disabled ? {} : { scale: 0.92 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              text.trim() && !sending && !disabled
                ? isImageMode
                  ? 'bg-gradient-to-r from-lilac-600 to-purple-600 text-white shadow-md cursor-pointer'
                  : 'bg-ink text-white dark:bg-white dark:text-ink shadow-md cursor-pointer'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
            aria-label={isImageMode ? 'Generate image diagram' : 'Send message'}
            title={isImageMode ? 'Generate diagram' : 'Send message (Enter)'}
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : isImageMode ? (
              <Sparkles className="w-4 h-4 text-white" />
            ) : (
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
