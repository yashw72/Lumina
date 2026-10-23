import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenText,
  MessageSquare,
  FileText,
  GraduationCap,
  Sparkles,
  Sun,
  Moon,
  ShieldCheck,
} from 'lucide-react';
import BackendBanner from '../common/BackendBanner';
import { useBackendStatus } from '../../hooks/useBackendStatus';

export default function AuthLayout({ children, title, subtitle }) {
  const { online, checking, retry, baseUrl } = useBackendStatus();
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem('documentor.theme') === 'dark' ||
      (!('documentor.theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('documentor.theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('documentor.theme', 'light');
    }
  }, [darkMode]);

  const benefits = [
    {
      icon: MessageSquare,
      title: 'Chat with sources',
      desc: 'Ask questions grounded strictly in your uploaded notes and textbooks.',
    },
    {
      icon: FileText,
      title: 'Summaries & key takeaways',
      desc: 'Transform dense material into clear, exam-ready review outlines.',
    },
    {
      icon: GraduationCap,
      title: 'Quizzes that test you',
      desc: 'Active recall flashcards and multi-choice quizzes with explanations.',
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-sand-50 dark:bg-ink text-ink dark:text-white transition-colors duration-200">
      <BackendBanner online={online} checking={checking} retry={retry} baseUrl={baseUrl} />
      <div className="flex-1 w-full flex">
        {/* LEFT: Brand showcase panel (Desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-lilac-600 via-indigo-600 to-violet-900 text-white shadow-2xl">
        {/* Soft decorative blurred background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-lilac-400/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-ink flex items-center justify-center shadow-md">
            <BookOpenText className="w-5 h-5 text-indigo-600 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-extrabold text-xl tracking-tight">DocuMentor</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-sm">
              AI
            </span>
          </div>
        </div>

        {/* Middle: Headline, Benefit Bullets & Floating Preview Card */}
        <div className="relative z-10 my-auto py-8 max-w-lg space-y-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-lilac-100 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Study Companion</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
              Learn smarter from your own documents.
            </h1>
            <p className="mt-3 text-sm text-white/80 leading-relaxed">
              Upload your PDFs, slides, and study notes. DocuMentor AI gives you grounded answers with citations, instant summaries, and interactive flashcards.
            </p>
          </div>

          {/* Three short benefit bullets */}
          <div className="space-y-4">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-white mt-0.5 flex-shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{b.title}</h3>
                    <p className="text-xs text-white/75 mt-0.5">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating mini mock preview card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs shadow-lg space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white/90">Grounded Q&A Preview</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/80">Page 4 Citation</span>
            </div>
            <p className="text-white/80 italic text-[11px] leading-relaxed">
              "A deadlock occurs when processes hold resources and wait indefinitely for others..."
            </p>
          </motion.div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-white/60">
          <ShieldCheck className="w-4 h-4 text-white/70" />
          <span>Private, isolated per-user workspaces &amp; encrypted tokens</span>
        </div>
      </div>

      {/* RIGHT: Form column */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-12 relative">
        {/* Top Bar: Theme toggle */}
        <div className="flex items-center justify-between w-full">
          {/* Mobile-only logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shadow-sm">
              <BookOpenText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-bold text-sm tracking-tight text-ink dark:text-white">DocuMentor AI</span>
          </div>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="ml-auto p-2 rounded-full border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac-500/40"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

        {/* Centered Form Card */}
        <div className="my-auto w-full max-w-md mx-auto py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink dark:text-white">{title}</h2>
            {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{subtitle}</p>}
          </div>

          <div className="glass rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-white/5 backdrop-blur-xl">
            {children}
          </div>
        </div>

        {/* Bottom copyright / terms info */}
        <div className="text-center text-xs text-slate-400 dark:text-slate-600">
          &copy; {new Date().getFullYear()} DocuMentor AI. Designed for student learning.
        </div>
      </div>
    </div>
  </div>
);
}
