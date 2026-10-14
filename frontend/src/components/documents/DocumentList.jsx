import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DocumentCard from './DocumentCard.jsx';
import SectionHeading from '../common/SectionHeading.jsx';
import Skeleton from '../common/Skeleton.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { Files, BookOpen, Layers, Sparkles } from 'lucide-react';

export default function DocumentList({ documents, loading, onDelete }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Knowledge Base"
          title="Your Library"
          subtitle="Loading your uploaded study materials..."
          centered={false}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="rounded-card p-6 bg-white dark:bg-ink-soft border border-black/8 dark:border-white/10 space-y-4"
            >
              <div className="flex justify-between items-center">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
              <Skeleton className="w-3/4 h-5 rounded-lg" />
              <Skeleton className="w-full h-16 rounded-2xl" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="flex-1 h-9 rounded-full" />
                <Skeleton className="flex-1 h-9 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Knowledge Base"
          title="Your Library"
          subtitle="Your indexed materials and active vectors"
          centered={false}
        />

        <EmptyState
          icon={Files}
          title="Upload your first document to get started"
          description="Drag and drop your lecture slides, notes, or textbook above to enable AI chat with page citations and interactive study tools."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-black/5 dark:border-white/5">
        <SectionHeading
          eyebrow="Knowledge Base"
          title="Your Library"
          subtitle="All documents are parsed and ready for contextual RAG search"
          centered={false}
        />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lilac-100/80 dark:bg-lilac-950/60 border border-lilac-200/80 dark:border-lilac-800/60 text-xs font-bold text-lilac-700 dark:text-lilac-300 shrink-0 self-start sm:self-auto">
          <span>{documents.length}</span>
          <span>{documents.length === 1 ? 'Document' : 'Documents'}</span>
        </div>
      </div>

      <motion.div
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {documents.map((doc) => (
            <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
