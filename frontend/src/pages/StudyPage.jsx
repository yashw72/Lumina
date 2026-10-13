import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useDocuments } from '../hooks/useDocuments.js';
import { getSummary, getFlashcards, getQuiz } from '../api/study.js';
import SummaryPanel from '../components/study/SummaryPanel.jsx';
import FlashcardDeck from '../components/study/FlashcardDeck.jsx';
import QuizPanel from '../components/study/QuizPanel.jsx';
import {
  GraduationCap,
  FileText,
  Layers,
  Award,
  ChevronDown,
  BookOpen,
} from 'lucide-react';

export default function StudyPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const docParam = searchParams.get('doc');
  const navigate = useNavigate();

  const { documents, loading: docsLoading } = useDocuments();

  const readyDocuments = useMemo(() => {
    return documents.filter((d) => d.status === 'ready');
  }, [documents]);

  const [selectedDocId, setSelectedDocId] = useState(null);

  // Initialize selected document from URL param or first ready document
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

  // Study generation state cache per document: { [docId]: { summary, flashcards, quiz, flashcardCount, quizCount } }
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

  // Handle document change
  const handleDocChange = (e) => {
    const newId = Number(e.target.value);
    setSelectedDocId(newId);
    setSearchParams({ doc: newId });
  };

  // Generate Summary
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

  // Generate Flashcards
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

  // Generate Quiz
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

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header bar with Document Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <span>AI Study Tools</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate executive summaries, flip flashcards, and quizzes from your notes.
          </p>
        </div>

        {/* Document Selector */}
        <div className="flex items-center gap-2 min-w-[280px]">
          <span className="text-xs font-semibold text-slate-500 shrink-0">Source:</span>
          <div className="relative flex-1">
            <select
              value={selectedDocId || ''}
              onChange={handleDocChange}
              disabled={readyDocuments.length === 0}
              className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium py-2.5 pl-3.5 pr-9 rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-500 truncate"
            >
              {readyDocuments.length === 0 ? (
                <option value="">No ready documents available</option>
              ) : (
                readyDocuments.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.filename} ({doc.page_count} pages)
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-semibold transition-all whitespace-nowrap focus:outline-none ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div>
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
      </div>
    </div>
  );
}
