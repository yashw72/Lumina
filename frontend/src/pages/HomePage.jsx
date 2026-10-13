import React from 'react';
import { useDocuments } from '../hooks/useDocuments.js';
import UploadBox from '../components/documents/UploadBox.jsx';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { Sparkles, BookOpen } from 'lucide-react';

export default function HomePage() {
  const { documents, loading, error, refresh, remove } = useDocuments();

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent RAG-Powered Study Assistant</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Supercharge your study notes with <span className="text-indigo-600 dark:text-indigo-400">DocuMentor AI</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Upload textbooks, lecture notes, or syllabus slides. Chat with exact page-level source citations and automatically generate summaries, flashcards, and quizzes.
        </p>
      </section>

      {/* Upload Box */}
      <section className="max-w-3xl mx-auto">
        <UploadBox onUploaded={refresh} />
      </section>

      {/* Documents Status */}
      <section className="max-w-5xl mx-auto pt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Document Library</span>
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {documents.length} {documents.length === 1 ? 'document' : 'documents'}
          </span>
        </div>

        {loading ? (
          <Loader message="Loading document library..." />
        ) : documents.length === 0 ? (
          <EmptyState
            title="No documents uploaded yet"
            description="Upload your first study document above to start asking questions and generating flashcards."
          />
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3 px-2 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">{doc.filename}</h4>
                  <p className="text-xs text-slate-500">{doc.page_count} pages • {doc.chunk_count} chunks • Status: {doc.status}</p>
                </div>
                <button
                  onClick={() => remove(doc.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
