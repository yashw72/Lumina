import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  GraduationCap,
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
  Layers,
  CheckCircle2,
  Database,
  Cpu,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments.js';
import { useAuth } from '../context/AuthContext';
import UploadBox from '../components/documents/UploadBox.jsx';
import DocumentList from '../components/documents/DocumentList.jsx';
import ChatPreviewCard from '../components/chat/ChatPreviewCard.jsx';
import Card from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import IconButton from '../components/common/IconButton.jsx';
import Reveal from '../components/common/Reveal.jsx';
import CountUp from '../components/common/CountUp.jsx';
import SectionHeading from '../components/common/SectionHeading.jsx';

export default function HomePage() {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.trim().split(/\s+/)[0] : 'Student';
  const { documents, loading, refresh, remove } = useDocuments();
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Compute live statistics from documents
  const totalChunks = documents.reduce((acc, doc) => acc + (doc.chunk_count || 0), 0);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 340;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section
        id="hero"
        className="bg-hero-gradient -mt-8 sm:-mt-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24 text-center rounded-b-[40px] border-b border-black/5 dark:border-white/5"
      >
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-bold text-ink dark:text-white shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-lilac-600 dark:text-lilac-400" />
            <span>Welcome back, {firstName}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-lilac-700 dark:text-lilac-300">RAG-Powered Study Assistant</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="text-[40px] sm:text-6xl md:text-[72px] font-extrabold tracking-tight text-ink dark:text-white leading-[1.06]"
          >
            Study smarter from{' '}
            <span className="bg-gradient-to-r from-lilac-600 via-lilac-500 to-purple-600 dark:from-lilac-400 dark:to-purple-300 bg-clip-text text-transparent px-1.5">
              your own notes
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed"
          >
            Upload your PDFs, notes or textbooks. Ask questions and get answers with the exact
            page they came from.
          </motion.p>

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

      {/* 2. Document Library Section */}
      <section className="max-w-6xl mx-auto px-2">
        <Reveal>
          <DocumentList
            documents={documents}
            loading={loading}
            onDelete={remove}
          />
        </Reveal>
      </section>

      {/* 3. Dark Feature Section */}
      <section className="max-w-6xl mx-auto px-2">
        <Reveal>
          <div className="bg-ink dark:bg-[#121217] text-white rounded-section p-8 sm:p-12 md:p-16 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Subtle corner stripes from the reference design */}
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-to-br from-lilac-500/20 to-transparent pointer-events-none blur-2xl"
              aria-hidden="true"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
              {/* Left: Floating Interactive Chat Preview Card */}
              <div className="lg:col-span-6 flex justify-center">
                <ChatPreviewCard />
              </div>

              {/* Right: Feature Description & Call to Action */}
              <div className="lg:col-span-6 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-lilac-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Strict Grounded Retrieval</span>
                </div>

                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Ask anything. Get answers with sources.
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                  No hallucinations. DocuMentor AI divides your documents into semantic embeddings
                  stored in ChromaDB. Every response is synthesized exclusively from matched
                  chunks and verified with page numbers.
                </p>

                <div className="pt-2">
                  <Button
                    to="/chat"
                    variant="secondary"
                    size="lg"
                    className="!bg-white !text-ink hover:!bg-slate-100 font-bold"
                  >
                    Start Chatting
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 4. Live Stats Row */}
      <section className="max-w-5xl mx-auto px-2">
        <Reveal>
          <div className="bg-white dark:bg-ink-soft rounded-card border border-black/8 dark:border-white/10 p-6 sm:p-10 shadow-card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-black/8 dark:divide-white/10 text-center">
              {/* Stat 1: Uploaded Documents */}
              <div className="px-4 py-2 sm:py-0 space-y-2">
                <div className="flex justify-center -space-x-1.5 mb-3">
                  <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center border border-white">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-white">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-white">
                    <File className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-white tracking-tight">
                  <CountUp end={documents.length} />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Active study documents in library
                </p>
              </div>

              {/* Stat 2: Total Knowledge Chunks */}
              <div className="px-4 py-4 md:py-0 space-y-2">
                <div className="flex justify-center mb-3">
                  <div className="w-7 h-7 rounded-full bg-lilac-100 text-lilac-700 flex items-center justify-center">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-white tracking-tight">
                  <CountUp end={totalChunks} />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Knowledge chunks indexed in vector store
                </p>
              </div>

              {/* Stat 3: Formats Supported */}
              <div className="px-4 py-4 md:py-0 space-y-2">
                <div className="flex justify-center mb-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-ink dark:text-white tracking-tight">
                  <CountUp end={4} suffix=" Formats" />
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  PDF, DOCX, TXT, and Markdown supported
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 5. Bento Row: Orange Card, Lilac Card, White Card */}
      <section className="max-w-6xl mx-auto px-2">
        <Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* (a) Orange Card: Study Tools */}
            <Card
              variant="orange"
              hoverable
              className="flex flex-col justify-between min-h-[320px] group cursor-pointer"
              onClick={() => navigate('/study')}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/80 block mb-1">
                  AI Study Tools
                </span>
                <h3 className="text-2xl font-bold text-white mb-6">
                  Practice & Master
                </h3>

                {/* 3 rows with sliding interaction */}
                <div className="space-y-2.5">
                  {[
                    { label: 'Executive Summaries', icon: FileText, tab: 'summary' },
                    { label: '3D Flip Flashcards', icon: Layers, tab: 'flashcards' },
                    { label: 'Interactive Quizzes', icon: GraduationCap, tab: 'quiz' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/study?tab=${item.tab}`);
                      }}
                      className="flex items-center justify-between p-3 rounded-2xl bg-white/15 backdrop-blur-xs transition-all duration-200 group-hover:translate-x-1 hover:bg-white/25 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-xs font-semibold text-white">
                        <item.icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-white/80" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-bold text-white">
                <span>Open study tools</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>

            {/* (b) Lilac Card: Chat with Notes */}
            <Card
              variant="lilac"
              hoverable
              className="flex flex-col justify-between min-h-[320px] group cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-lilac-700 dark:text-lilac-300 block mb-1">
                  RAG Conversational Assistant
                </span>
                <h3 className="text-2xl font-bold text-ink dark:text-white mb-4">
                  Chat with your notes
                </h3>

                {/* Floating chat bubbles art */}
                <div className="py-4 space-y-3">
                  <div className="bg-white dark:bg-ink p-3 rounded-2xl shadow-sm text-xs text-ink dark:text-white border border-black/5 dark:border-white/5 max-w-[85%]">
                    Can you explain Coffman conditions?
                  </div>
                  <div className="bg-lilac-600 text-white p-3 rounded-2xl shadow-sm text-xs ml-auto max-w-[88%] font-medium">
                    Mutual exclusion, hold & wait, no preemption, circular wait.
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  to="/chat"
                  variant="primary"
                  size="sm"
                  className="w-full justify-between"
                >
                  Try Chat Now
                </Button>
              </div>
            </Card>

            {/* (c) White Card: Your Library */}
            <Card
              variant="white"
              hoverable
              className="flex flex-col justify-between min-h-[320px] group"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Vectorized Storage
                </span>
                <h3 className="text-2xl font-bold text-ink dark:text-white mb-2">
                  Your library
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Every uploaded file is embedded locally using sentence-transformers and indexed
                  instantly.
                </p>

                {/* File icons badge cluster */}
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-black/5 dark:border-white/5">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-ink flex items-center justify-center text-rose-500 shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-ink flex items-center justify-center text-blue-500 shadow-2xs">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-ink flex items-center justify-center text-lilac-600 shadow-2xs">
                    <FileCode className="w-5 h-5" />
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-ink flex items-center justify-center text-emerald-500 shadow-2xs">
                    <File className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>{documents.length} loaded documents</span>
                <FolderOpen className="w-4 h-4 text-slate-400" />
              </div>
            </Card>
          </div>
        </Reveal>
      </section>

      {/* 6. "How it Works" Carousel */}
      <section className="max-w-6xl mx-auto px-2">
        <Reveal>
          <div className="space-y-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lilac-600 dark:text-lilac-400">
                  Step by step
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-ink dark:text-white tracking-tight">
                  How DocuMentor AI Works
                </h2>
              </div>

              {/* Carousel navigation arrow buttons matching reference */}
              <div className="flex items-center gap-2">
                <IconButton
                  icon={ArrowLeft}
                  variant="white"
                  size="md"
                  aria-label="Previous step"
                  onClick={() => scrollCarousel('left')}
                />
                <IconButton
                  icon={ArrowRight}
                  variant="orange"
                  size="md"
                  aria-label="Next step"
                  onClick={() => scrollCarousel('right')}
                />
              </div>
            </div>

            {/* Scroll-snap step cards */}
            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none"
            >
              {[
                {
                  step: '01',
                  title: 'Upload and Index',
                  desc: 'Drop your PDF, DOCX, TXT or MD files. The backend extracts text, splits it into overlapping chunks, and computes embeddings.',
                  icon: FileText,
                },
                {
                  step: '02',
                  title: 'Ask and Get Sources',
                  desc: 'Ask any natural language question. The system searches ChromaDB for nearest neighbors and passes the top chunks to the LLM.',
                  icon: MessageSquare,
                },
                {
                  step: '03',
                  title: 'Study & Test Recall',
                  desc: 'Generate executive summaries, flip interactive 3D flashcards, and take scored quizzes with immediate explanation cards.',
                  icon: GraduationCap,
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="min-w-[280px] sm:min-w-[340px] flex-1 snap-start rounded-card p-7 bg-gradient-to-br from-lilac-50/90 via-white to-lilac-100/60 dark:from-ink-soft dark:to-lilac-950/20 border border-lilac-200/80 dark:border-white/10 shadow-card flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-lilac-600 dark:text-lilac-400 font-mono">
                        {card.step}
                      </span>
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-ink text-ink dark:text-white flex items-center justify-center shadow-sm">
                        <card.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-ink dark:text-white">
                      {card.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
