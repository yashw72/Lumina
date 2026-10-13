import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble.jsx';
import ChatInput from './ChatInput.jsx';
import { Sparkles, MessageSquare, Lightbulb, Bot, ShieldCheck } from 'lucide-react';

const STARTER_QUESTIONS = [
  'What are the four necessary conditions for deadlock in operating systems?',
  'Explain the TCP Three-Way Handshake and connection state transitions.',
  'What is the difference between 3NF and BCNF in database normalization?',
  'Summarize the core takeaways and theorems from my uploaded document.',
];

export default function ChatWindow({
  messages = [],
  sending = false,
  onSend,
  selectedDocCount = 0,
}) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  return (
    <div className="flex flex-col h-[700px] max-h-[82vh] bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Chat with your course documents
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Ask anything about your uploaded study material. Every answer is grounded directly in
              the text, with verifiable page citations.
            </p>

            <div className="w-full space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Suggested questions:</span>
              </div>

              {STARTER_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSend(q)}
                  disabled={sending}
                  className="w-full text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-150 shadow-2xs group flex items-center justify-between"
                >
                  <span className="line-clamp-1">{q}</span>
                  <span className="text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform text-xs ml-2 shrink-0">
                    →
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}

            {/* Thinking / Typing indicator */}
            {sending && (
              <div className="flex items-start gap-3 animate-in fade-in duration-200">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
                      DocuMentor is thinking & retrieving relevant passages...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white/70 dark:bg-slate-900/70 border-t border-slate-200/80 dark:border-slate-800 backdrop-blur-sm">
        <ChatInput onSend={onSend} sending={sending} />
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Strict RAG: Answers strictly grounded in documents</span>
          </span>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
