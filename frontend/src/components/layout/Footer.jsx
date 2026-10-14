import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpenText, ArrowRight, ExternalLink } from 'lucide-react';

export default function Footer({ compact = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleUploadClick = () => {
    if (location.pathname !== '/') {
      navigate('/#upload');
    } else {
      const el = document.getElementById('upload');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full mt-16 pt-6">
      <div className="bg-ink dark:bg-[#121217] text-white rounded-section p-8 sm:p-12 border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Subtle diagonal background stripes in corner like reference */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full opacity-10 bg-radial from-lilac-400 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        {!compact && (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pb-12 mb-10 border-b border-white/10">
            <div className="max-w-xl space-y-2">
              <span className="text-xs font-bold tracking-wider uppercase text-lilac-300">
                Supercharge Your Learning
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Ready to study with verified source citations?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload your course materials and let DocuMentor AI turn them into interactive chats,
                flip flashcards, and practice quizzes.
              </p>
            </div>

            {/* Pill CTA button with arrow circle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleUploadClick}
                className="inline-flex items-center gap-3 bg-white text-ink hover:bg-slate-100 font-bold px-6 py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-lilac-400"
              >
                <span>Upload a document</span>
                <span className="w-8 h-8 rounded-full bg-ink text-white flex items-center justify-center transition-transform group-hover:translate-x-1">
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
          {/* Col 1: Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white text-ink flex items-center justify-center">
                <BookOpenText className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">DocuMentor AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Grounded RAG study assistant built with FastAPI, ChromaDB, and React.
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Pages</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Documents Library</Link>
              </li>
              <li>
                <Link to="/chat" className="hover:text-white transition-colors">RAG Chat</Link>
              </li>
              <li>
                <Link to="/study" className="hover:text-white transition-colors">Study Aids</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Resources</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>FastAPI Docs</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <span className="text-slate-500">API Contract</span>
              </li>
              <li>
                <span className="text-slate-500">Architecture Guide</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Project Team */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Project Team</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <span className="text-white font-medium">Yash</span> — Backend & RAG
              </li>
              <li>
                <span className="text-white font-medium">Kaustubh</span> — Frontend & UX
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 DocuMentor AI. Designed with Plus Jakarta Sans & Framer Motion.</p>
          <div className="flex items-center gap-3">
            <span>FastAPI 0.115+</span>
            <span>•</span>
            <span>ChromaDB</span>
            <span>•</span>
            <span>Google Gemini</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
