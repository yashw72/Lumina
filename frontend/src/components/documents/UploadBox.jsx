import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileUp,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { uploadDocument } from '../../api/documents.js';

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export default function UploadBox({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast.error(`Invalid file type. Only ${ACCEPTED_EXTENSIONS.join(', ')} files are supported.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('File size exceeds 20 MB limit. Please select a smaller file.');
      return false;
    }

    return true;
  };

  const handleUpload = async (file) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setProgress(0);
    setIsProcessing(false);
    setFileName(file.name);
    setIsSuccess(false);

    try {
      const result = await uploadDocument(file, (percent) => {
        setProgress(percent);
        if (percent >= 100) {
          setIsProcessing(true);
        }
      });

      setIsSuccess(true);
      toast.success(`"${file.name}" uploaded and indexed successfully!`);

      if (onUploaded) {
        onUploaded(result);
      }

      // Reset after brief success animation
      setTimeout(() => {
        setIsSuccess(false);
        setUploading(false);
        setProgress(0);
        setIsProcessing(false);
        setFileName('');
      }, 1600);
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
      setUploading(false);
      setProgress(0);
      setIsProcessing(false);
      setFileName('');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (uploading) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  return (
    <div id="upload" className="w-full max-w-2xl mx-auto space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {/* Wide White Pill Upload Input Container */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        animate={{
          scale: isDragging ? 1.02 : 1,
          boxShadow: isDragging
            ? '0 20px 60px -15px rgba(168, 85, 247, 0.35)'
            : '0 12px 36px -12px rgba(11, 11, 15, 0.12)',
        }}
        transition={{ duration: 0.2 }}
        className={`relative overflow-hidden rounded-full p-2.5 sm:p-3 transition-colors duration-200 cursor-pointer select-none bg-white dark:bg-ink-soft border ${
          isDragging
            ? 'border-lilac-500 ring-4 ring-lilac-400/20'
            : 'border-black/10 dark:border-white/10 hover:border-lilac-400 dark:hover:border-lilac-600'
        }`}
      >
        {/* Progress Bar Fill Background during upload */}
        {uploading && (
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
            className={`absolute inset-0 rounded-full z-0 ${
              isProcessing
                ? 'bg-lilac-200/50 dark:bg-lilac-900/40 shimmer'
                : 'bg-lilac-100 dark:bg-lilac-950/60'
            }`}
          />
        )}

        <div className="relative z-10 flex items-center justify-between gap-3 px-3 sm:px-4">
          {/* Left: Icon & Status / Placeholder Text */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                isDragging ? 'scale-110' : ''
              } ${
                isSuccess
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
                  : uploading
                  ? 'bg-lilac-100 text-lilac-600 dark:bg-lilac-950 dark:text-lilac-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : uploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <FileUp className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              {isSuccess ? (
                <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300 truncate block">
                  Document Indexed!
                </span>
              ) : uploading ? (
                <div className="flex flex-col">
                  <span className="font-bold text-xs sm:text-sm text-ink dark:text-white truncate">
                    {isProcessing ? 'Processing & embedding...' : `Uploading ${fileName}`}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isProcessing ? 'Splitting into knowledge chunks' : `${progress}% completed`}
                  </span>
                </div>
              ) : (
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400 truncate block">
                  {isDragging ? (
                    <strong className="text-lilac-600 font-bold">Release to upload</strong>
                  ) : (
                    <>Drop a file here or <span className="text-ink dark:text-white font-semibold underline underline-offset-2">browse</span></>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Right: Signature Black Upload Pill Button */}
          <div className="shrink-0">
            <button
              type="button"
              disabled={uploading}
              className="inline-flex items-center gap-2 pl-4 pr-1.5 py-1.5 rounded-full bg-ink text-white dark:bg-white dark:text-ink text-xs font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md group"
            >
              <span>{uploading ? `${progress}%` : 'Upload'}</span>
              <span className="w-7 h-7 rounded-full bg-white text-ink dark:bg-ink dark:text-white flex items-center justify-center transition-transform group-hover:translate-x-0.5 shadow-2xs">
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Small Muted Format Chips Below */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="font-medium">Supported formats:</span>
        <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          .PDF
        </span>
        <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          .DOCX
        </span>
        <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          .TXT
        </span>
        <span className="px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
          .MD
        </span>
        <span className="text-slate-400">•</span>
        <span>Up to 20 MB</span>
      </div>
    </div>
  );
}
