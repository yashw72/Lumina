import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Filter,
  RotateCcw,
  Check,
  Layers,
  ChevronDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments.js';
import { useChat } from '../hooks/useChat.js';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import Button from '../components/common/Button.jsx';
import IconButton from '../components/common/IconButton.jsx';
import Badge from '../components/common/Badge.jsx';

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const docParam = searchParams.get('doc');

  const { documents, loading: docsLoading } = useDocuments();

  // Filter only ready documents
  const readyDocuments = useMemo(() => {
    return documents.filter((doc) => doc.status === 'ready');
  }, [documents]);

  // Selected document IDs (empty array means search all documents)
  const [selectedDocIds, setSelectedDocIds] = useState(() => {
    if (docParam) {
      const parsedId = Number(docParam);
      return isNaN(parsedId) ? [] : [parsedId];
    }
    return [];
  });

  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Sync if URL query param ?doc= changes
  useEffect(() => {
    if (docParam) {
      const parsedId = Number(docParam);
      if (!isNaN(parsedId)) {
        setSelectedDocIds((prev) => (prev.includes(parsedId) ? prev : [parsedId]));
      }
    }
  }, [docParam]);

  const { messages, sending, sessionId, send, newChat } = useChat(selectedDocIds);

  const toggleDocSelection = (id) => {
    setSelectedDocIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedDocIds([]);
  };

  const isAllSelected = selectedDocIds.length === 0;

  const sidebarContent = (
    <div className="space-y-4">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-lilac-200/80 text-lilac-700 dark:bg-lilac-900 dark:text-lilac-200 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink dark:text-white">Your Documents</h3>
            <p className="text-[10px] text-slate-500">{readyDocuments.length} Indexed</p>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          hideArrow
          icon={RotateCcw}
          onClick={newChat}
          disabled={messages.length === 0 && !sessionId}
          className="!text-[11px] !py-1 !px-3 !h-8"
        >
          New Chat
        </Button>
      </div>

      {/* Checklist */}
      <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
        {/* "All documents" toggle option */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-semibold transition-all ${
            isAllSelected
              ? 'bg-ink text-white dark:bg-white dark:text-ink shadow-sm'
              : 'bg-white/80 dark:bg-black/20 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-black/40 border border-black/5 dark:border-white/5'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4" />
            <span>All Documents</span>
          </div>

          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              isAllSelected
                ? 'bg-white text-ink dark:bg-ink dark:text-white border-transparent'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          >
            {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </div>
        </button>

        {/* Individual ready documents */}
        {docsLoading ? (
          <p className="text-xs text-slate-400 p-4 text-center">Loading sources...</p>
        ) : readyDocuments.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-black/20 text-center">
            <p className="text-xs text-slate-500">No ready documents in library.</p>
          </div>
        ) : (
          readyDocuments.map((doc) => {
            const isChecked = !isAllSelected && selectedDocIds.includes(doc.id);

            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => toggleDocSelection(doc.id)}
                className={`w-full flex items-start justify-between p-3 rounded-2xl text-left text-xs transition-all ${
                  isChecked
                    ? 'bg-lilac-200/90 dark:bg-lilac-950/80 border border-lilac-300 dark:border-lilac-700 text-ink dark:text-white shadow-xs'
                    : 'bg-white/70 dark:bg-black/20 border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-black/40'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 pr-2">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold truncate" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {doc.page_count} pages • {doc.chunk_count} chunks
                    </p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border transition-all ${
                    isChecked
                      ? 'bg-lilac-600 text-white border-transparent'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  <AnimatePresence>
                    {isChecked && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Status Bar */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-lilac-600 dark:text-lilac-400">
            Conversational RAG
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-white tracking-tight">
            Chat with Documents
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile filter toggle button */}
          <div className="md:hidden">
            <IconButton
              icon={SlidersHorizontal}
              variant="orange"
              size="md"
              aria-label="Open document selection drawer"
              onClick={() => setMobileDrawerOpen(true)}
            />
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300 text-xs font-bold">
            {isAllSelected
              ? `All (${readyDocuments.length}) sources`
              : `${selectedDocIds.length} source${selectedDocIds.length === 1 ? '' : 's'} active`}
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Desktop Left Panel */}
        <aside className="hidden md:block md:col-span-4 lg:col-span-3 rounded-card p-5 bg-gradient-to-br from-lilac-50/90 via-lilac-100/50 to-white dark:from-ink-soft dark:to-lilac-950/20 border border-lilac-200/80 dark:border-white/10 shadow-card">
          {sidebarContent}
        </aside>

        {/* Right Main Chat Window */}
        <section className="md:col-span-8 lg:col-span-9">
          <ChatWindow
            messages={messages}
            sending={sending}
            onSend={send}
            hasReadyDocuments={readyDocuments.length > 0}
          />
        </section>
      </div>

      {/* Mobile Animated Drawer Overlay */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-ink/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-4/5 max-w-sm h-full bg-cream dark:bg-ink p-6 shadow-2xl z-10 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5 text-ink dark:text-white" />
                  </button>
                </div>
                {sidebarContent}
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full mt-4"
              >
                Apply Sources
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
