import React from 'react';

export default function HomePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">
        DocuMentor AI
      </h1>
      <p className="text-slate-600 dark:text-slate-400">
        AI-Powered RAG study assistant. Upload documents to chat and generate study tools.
      </p>
    </div>
  );
}
