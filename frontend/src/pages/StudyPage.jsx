import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDocuments } from '../hooks/useDocuments.js';
import { getSummary, getFlashcards, getQuiz } from '../api/study.js';
import SummaryPanel from '../components/study/SummaryPanel.jsx';
import FlashcardDeck from '../components/study/FlashcardDeck.jsx';
import QuizPanel from '../components/study/QuizPanel.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import {
  GraduationCap,
  FileText,
  Layers,
  Award,
  ChevronDown,
  Upload,
  FileQuestion,
} from 'lucide-react';

export default function StudyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const docParam = searchParams.get('doc');

  const { documents, loading: docsLoading } = useDocuments();

  const readyDocuments = useMemo(() => {
    return documents.filter((d) => d.status === 'ready');
  }, [documents]);

  const [selectedDocId, setSelectedDocId] = useState(null);

  useEffect(() => {
    if (readyDocuments.length > 0) {
      if (docParam) {
        const found = readyDocuments.find((d) => d.id === Number(docParam));
        if (found) {
          setSelectedDocId(found.id);
          return;
        }
      }
      if (!selectedDocId) {
        setSelectedDocId(readyDocuments[0].id);
      }
    }
  }, [readyDocuments, docParam]);

  // Tabs: 'summary' | 'flashcards' | 'quiz'
  const [activeTab, setActiveTab] = useState('summary');

  // Study generation state cache per document
  const [studyCache, setStudyCache] = useState({});

  // Loading states
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);

  // Counts
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [quizCount, setQuizCount] = useState(5);

  const selectedDocument = useMemo(() => {
    return readyDocuments.find((d) => d.id === Number(selectedDocId)) || null;
  }, [readyDocuments, selectedDocId]);

  const currentData = selectedDocId ? studyCache[selectedDocId] || {} : {};

  const handleDocChange = (e) => {
    const newId = Number(e.target.value);
    setSelectedDocId(newId);
    setSearchParams({ doc: newId });
  };

  const handleGenerateSummary = async () => {
    if (!selectedDocId) return;
    setSummaryLoading(true);
    try {
      const res = await getSummary(selectedDocId);
      setStudyCache((prev) => ({
        ...prev,
        [selectedDocId]: {
          ...(prev[selectedDocId] || {}),
          summary: res.summary,
        },
      }));
      toast.success('Summary generated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleGenerateFlashcards = async (count = flashcardCount) => {
    if (!selectedDocId) return;
    setFlashcardsLoading(true);
    try {
      const res = await getFlashcards(selectedDocId, count);
      setStudyCache((prev) => ({
        ...prev,
        [selectedDocId]: {
          ...(prev[selectedDocId] || {}),
          flashcards: res.flashcards,
        },
      }));
      toast.success(`${res.flashcards.length} flashcards generated!`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate flashcards');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  const handleGenerateQuiz = async (count = quizCount) => {
    if (!selectedDocId) return;
    setQuizLoading(true);
    try {
      const res = await getQuiz(selectedDocId, count);
      setStudyCache((prev) => ({
        ...prev,
        [selectedDocId]: {
          ...(prev[selectedDocId] || {}),
          quiz: res.questions,
        },
      }));
      toast.success(`${res.questions.length}-question quiz ready!`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate quiz');
    } finally {
      setQuizLoading(false);
    }
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'quiz', label: 'Practice Quiz', icon: Award },
  ];

  if (!docsLoading && readyDocuments.length === 0) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <EmptyState
          icon={FileQuestion}
          title="No ready documents available"
          description="Upload a study document on the home page first to generate summaries, 3D flashcards, and quizzes."
          action={
            <Link
              to="/#upload"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-xs font-bold shadow-md hover:scale-105 transition-transform"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header bar with SectionHeading & Document Pill Select */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-black/5 dark:border-white/5">
        <SectionHeading
          as="h1"
          eyebrow="Active Recall"
          title="Study Tools"
          subtitle="Generate executive summaries, flip flashcards, and practice quizzes."
          centered={false}
        />

        {/* Pill-shaped document selector */}
        <div className="relative min-w-[260px] self-start sm:self-auto">
          <select
            value={selectedDocId || ''}
            onChange={handleDocChange}
            disabled={readyDocuments.length === 0}
            className="w-full appearance-none bg-white dark:bg-ink-soft border border-black/10 dark:border-white/10 text-ink dark:text-white text-xs sm:text-sm font-semibold py-2.5 pl-4 pr-10 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-lilac-500 truncate cursor-pointer"
          >
            {readyDocuments.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.filename} ({doc.page_count} pages)
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Segmented Tab Control in Glass Pill with Sliding Indicator */}
      <div className="flex justify-center sm:justify-start">
        <div
          role="tablist"
          aria-label="Study aids navigation"
          className="glass p-1.5 rounded-full inline-flex items-center gap-1 shadow-sm border border-black/5 dark:border-white/10"
        >
          {tabs.map(({ id, label, icon: Icon }, idx) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                id={`tab-${id}`}
                tabIndex={isActive ? 0 : -1}
                aria-selected={isActive}
                aria-controls={`panel-${id}`}
                type="button"
                onClick={() => setActiveTab(id)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const nextTab = tabs[(idx + 1) % tabs.length];
                    setActiveTab(nextTab.id);
                    document.getElementById(`tab-${nextTab.id}`)?.focus();
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const prevTab = tabs[(idx - 1 + tabs.length) % tabs.length];
                    setActiveTab(prevTab.id);
                    document.getElementById(`tab-${prevTab.id}`)?.focus();
                  }
                }}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-xs font-bold transition-colors select-none flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac-500 ${
                  isActive
                    ? 'text-white dark:text-ink'
                    : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="studyTabPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-ink dark:bg-white rounded-full z-0 shadow-sm"
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cross-fading Tab Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeTab === 'summary' && (
            <SummaryPanel
              summary={currentData.summary}
              loading={summaryLoading}
              onGenerate={handleGenerateSummary}
              disabled={!selectedDocId}
              documentTitle={selectedDocument?.filename || 'the selected document'}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardDeck
              flashcards={currentData.flashcards}
              loading={flashcardsLoading}
              count={flashcardCount}
              onCountChange={setFlashcardCount}
              onGenerate={handleGenerateFlashcards}
              disabled={!selectedDocId}
              documentTitle={selectedDocument?.filename || 'the selected document'}
            />
          )}

          {activeTab === 'quiz' && (
            <QuizPanel
              questions={currentData.quiz}
              loading={quizLoading}
              count={quizCount}
              onCountChange={setQuizCount}
              onGenerate={handleGenerateQuiz}
              disabled={!selectedDocId}
              documentTitle={selectedDocument?.filename || 'the selected document'}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
