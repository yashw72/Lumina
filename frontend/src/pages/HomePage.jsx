import React from 'react';
import { useDocuments } from '../hooks/useDocuments.js';
import UploadBox from '../components/documents/UploadBox.jsx';
import DocumentList from '../components/documents/DocumentList.jsx';
import { Sparkles, BookOpen, Layers } from 'lucide-react';

export default function HomePage() {
  const { documents, loading, refresh, remove } = useDocuments();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/70 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-5 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent RAG-Powered Study Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Turn your course material into an <span className="text-indigo-600 dark:text-indigo-400">interactive mentor</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload textbooks, lecture notes, or syllabus slides. Chat with exact page-level source citations and automatically generate summaries, flashcards, and quizzes.
        </p>
      </section>

      {/* Upload Box */}
      <section className="max-w-3xl mx-auto">
        <UploadBox onUploaded={refresh} />
      </section>

      {/* Document Library Section */}
      <section className="max-w-6xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                Document Library
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage your uploaded study material and embeddings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </span>
          </div>
        </div>

        <DocumentList
          documents={documents}
          loading={loading}
          onDelete={remove}
        />
      </section>
    </div>
  );
}
