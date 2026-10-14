import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments.js';
import UploadBox from '../components/documents/UploadBox.jsx';
import DocumentList from '../components/documents/DocumentList.jsx';
import Reveal from '../components/common/Reveal.jsx';

export default function HomePage() {
  const { documents, loading, refresh, remove } = useDocuments();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section
        id="hero"
        className="bg-hero-gradient -mt-8 sm:-mt-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center rounded-b-[40px] border-b border-black/5 dark:border-white/5"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Eyebrow Glass Chip */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-bold text-ink dark:text-white shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-lilac-600 dark:text-lilac-400" />
            <span>RAG-Powered Study Assistant</span>
          </motion.div>

          {/* Huge Centered Bold Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-ink dark:text-white leading-[1.06]"
          >
            Study smarter from{' '}
            <span className="bg-gradient-to-r from-lilac-600 via-lilac-500 to-purple-600 dark:from-lilac-400 dark:to-purple-300 bg-clip-text text-transparent px-1.5">
              your own notes
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Upload your PDFs, notes or textbooks. Ask questions and get answers with the exact
            page they came from.
          </motion.p>

          {/* Wide Pill Upload Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="pt-4"
          >
            <UploadBox onUploaded={refresh} />
          </motion.div>
        </div>
      </section>

      {/* Document Library Section */}
      <section className="max-w-6xl mx-auto px-2">
        <Reveal>
          <DocumentList
            documents={documents}
            loading={loading}
            onDelete={remove}
          />
        </Reveal>
      </section>
    </div>
  );
}
