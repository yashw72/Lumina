import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy,
  Check,
  BookOpenText,
  ChevronDown,
  FileText,
  Maximize2,
  Download,
  ExternalLink,
  Sparkles,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SourceCard from './SourceCard.jsx';

export default function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isUser = message.role === 'user';
  const sources = message.sources || [];
  const hasSources = sources.length > 0;

  const rawImageUrl = message.image_url;
  const imageUrl = React.useMemo(() => {
    if (!rawImageUrl) return null;
    if (rawImageUrl.startsWith('http://') || rawImageUrl.startsWith('https://')) {
      return rawImageUrl;
    }
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    const cleanBase = apiBase.replace(/\/+$/, '');
    const cleanPath = rawImageUrl.startsWith('/') ? rawImageUrl : `/${rawImageUrl}`;
    return `${cleanBase}${cleanPath}`;
  }, [rawImageUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Answer copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {
      toast.error('Failed to copy text');
    }
  };

  const handleDownloadImage = async (e) => {
    e?.stopPropagation();
    if (!imageUrl) return;

    try {
      const resp = await fetch(imageUrl);
      const blob = await resp.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `study-diagram-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('Diagram downloaded successfully');
    } catch (_) {
      // Fallback: direct window open
      window.open(imageUrl, '_blank');
    }
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex justify-end mb-4"
      >
        <div className="bg-ink text-white dark:bg-white dark:text-ink px-5 py-3.5 rounded-[24px] rounded-tr-xs shadow-md max-w-[85%] sm:max-w-[75%] text-xs sm:text-sm font-medium leading-relaxed break-words">
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex items-start gap-3 mb-6 group"
      >
        {/* Assistant Avatar */}
        <div className="w-8 h-8 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shrink-0 shadow-sm mt-1">
          <BookOpenText className="w-4 h-4 stroke-[2.2]" />
        </div>

        {/* Assistant Message Bubble */}
        <div className="flex-1 bg-white dark:bg-[#16161D] border border-black/8 dark:border-white/10 rounded-[28px] rounded-tl-xs p-5 sm:p-6 shadow-card transition-colors">
          {/* Header & Copy Button */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-black/5 dark:border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink dark:text-white">DocuMentor AI</span>
              {imageUrl ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Visual Explanation</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300">
                  Grounded RAG
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-ink dark:hover:text-white p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
              aria-label="Copy assistant answer"
              title="Copy answer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold">Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Generated Image Card */}
          {imageUrl && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-slate-50 dark:bg-[#0E0E13] shadow-sm relative group/img">
              {/* Image Header Pill */}
              <div className="flex items-center justify-between px-3.5 py-2 border-b border-black/5 dark:border-white/5 bg-white/60 dark:bg-black/20 text-xs">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold text-[11px]">
                  <ImageIcon className="w-3.5 h-3.5 text-lilac-600 dark:text-lilac-400" />
                  <span>Interactive Concept Diagram</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title="Download diagram"
                    aria-label="Download diagram"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-ink dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    title="View fullscreen"
                    aria-label="View fullscreen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Image Viewport */}
              <div
                className="relative cursor-pointer overflow-hidden flex items-center justify-center min-h-[220px] bg-slate-100 dark:bg-black/30"
                onClick={() => setLightboxOpen(true)}
              >
                {!imgLoaded && !imgError && (
                  <div className="absolute inset-0 shimmer flex items-center justify-center">
                    <span className="text-xs text-slate-400 font-medium">Loading diagram...</span>
                  </div>
                )}
                {imgError ? (
                  <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      Diagram preview could not be displayed directly.
                    </p>
                    <a
                      href={imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-lilac-600 dark:text-lilac-400 font-bold hover:underline"
                    >
                      <span>Open image in new tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt="Educational concept diagram"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => {
                      setImgLoaded(true);
                      setImgError(true);
                    }}
                    className={`w-full max-h-[440px] object-contain transition-transform duration-300 group-hover/img:scale-[1.01] ${
                      imgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading="lazy"
                  />
                )}

                {/* Click to Expand Hover Prompt */}
                {!imgError && (
                  <div className="absolute bottom-3 right-3 opacity-0 group-hover/img:opacity-100 transition-opacity bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 pointer-events-none shadow-md">
                    <Maximize2 className="w-3 h-3" />
                    <span>Click to expand</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Markdown Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-ink dark:text-slate-200 leading-relaxed space-y-3">
            <ReactMarkdown
              components={{
                img: ({ node, ...props }) => (
                  <div className="my-3 rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 shadow-sm bg-slate-50 dark:bg-black/30">
                    <img {...props} className="w-full h-auto max-h-[400px] object-contain mx-auto" loading="lazy" />
                  </div>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Sources Section */}
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5">
            {hasSources ? (
              <div>
                <button
                  type="button"
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lilac-100/80 dark:bg-lilac-950/60 border border-lilac-200/80 dark:border-lilac-800/60 text-xs font-bold text-lilac-700 dark:text-lilac-300 hover:bg-lilac-200/70 transition-colors focus:outline-none"
                >
                  <FileText className="w-3.5 h-3.5 text-lilac-600 dark:text-lilac-400" />
                  <span>Sources ({sources.length})</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      sourcesOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {sourcesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden mt-3 space-y-2.5"
                    >
                      {sources.map((src, idx) => (
                        <SourceCard key={idx} source={src} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                {imageUrl
                  ? 'Diagram synthesized from concept principles.'
                  : 'No matching content found in your documents.'}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[92vh] w-full bg-[#121217] rounded-[28px] border border-white/15 overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal Bar */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-lilac-400" />
                  <span className="font-bold text-sm">Visual Study Diagram</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadImage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Open original in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => setLightboxOpen(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-rose-500/80 text-white transition-colors ml-1"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Full Image */}
              <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-black/30">
                <img
                  src={imageUrl}
                  alt="Full resolution concept diagram"
                  className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
