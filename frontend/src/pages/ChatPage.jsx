import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments.js';
import { useChat } from '../hooks/useChat.js';
import ChatWindow from '../components/chat/ChatWindow.jsx';
import Button from '../components/common/Button.jsx';
import {
  FileText,
  Filter,
  RotateCcw,
  CheckSquare,
  Square,
  Layers,
  ChevronDown,
  ChevronUp,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  return (
    <div className="space-y-4">
      {/* Top Header bar with Session ID, Document toggle, and New Chat */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            title="Toggle document selection sidebar"
            aria-label="Toggle document selection sidebar"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Chat with Documents</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAllSelected
                ? `Searching across all ${readyDocuments.length} ready documents`
                : `Searching within ${selectedDocIds.length} selected document${selectedDocIds.length === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={newChat}
            disabled={messages.length === 0 && !sessionId}
            title="Start a new chat session"
          >
            New Chat
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Filter Panel + Right Chat Window */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side Panel */}
        <aside
          className={`${
            sidebarOpen ? 'block' : 'hidden md:block'
          } md:col-span-4 lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all`}
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Target Sources</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {readyDocuments.length} Available
            </span>
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
            {/* "All Documents" toggle item */}
            <button
              type="button"
              onClick={handleSelectAll}
              className={`w-full flex items-center justify-between p-3 rounded-2xl text-left text-xs font-semibold transition-all ${
                isAllSelected
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300'
                  : 'bg-slate-50 dark:bg-slate-800/50 border border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>All Documents</span>
              </div>
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Individual documents checklist */}
            {docsLoading ? (
              <p className="text-xs text-slate-400 p-3 text-center">Loading sources...</p>
            ) : readyDocuments.length === 0 ? (
              <div className="p-4 text-center rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No ready documents found. Upload a file on the home page first.
                </p>
              </div>
            ) : (
              readyDocuments.map((doc) => {
                const checked = !isAllSelected && selectedDocIds.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => toggleDocSelection(doc.id)}
                    className={`w-full flex items-start justify-between p-3 rounded-2xl text-left text-xs transition-all ${
                      checked
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/70 text-indigo-900 dark:text-indigo-200'
                        : 'bg-slate-50 dark:bg-slate-800/40 border border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 pr-2">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="font-medium truncate" title={doc.filename}>
                          {doc.filename}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {doc.page_count} pages • {doc.chunk_count} chunks
                        </p>
                      </div>
                    </div>
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Chat Window */}
        <section className="md:col-span-8 lg:col-span-9">
          <ChatWindow
            messages={messages}
            sending={sending}
            onSend={send}
            selectedDocCount={selectedDocIds.length}
          />
        </section>
      </div>
    </div>
  );
}
