import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocument } from '../../api/documents.js';
import Button from '../common/Button.jsx';

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export default function UploadBox({ onUploaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('');

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

    try {
      const result = await uploadDocument(file, (percent) => {
        setProgress(percent);
        if (percent >= 100) {
          setIsProcessing(true);
        }
      });

      toast.success(`"${file.name}" uploaded and indexed successfully!`);
      if (onUploaded) {
        onUploaded(result);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setUploading(false);
      setProgress(0);
      setIsProcessing(false);
      setFileName('');
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
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-3xl p-8 sm:p-10 transition-all duration-200 border-2 border-dashed ${
        isDragging
          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 ring-4 ring-indigo-500/10'
          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-indigo-400 dark:hover:border-indigo-500'
      } shadow-sm`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      <div className="flex flex-col items-center justify-center text-center">
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
            isDragging
              ? 'scale-110 bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
              : 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400'
          }`}
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
          {uploading ? `Uploading ${fileName}...` : 'Upload your study documents'}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-5">
          Drag and drop your study material here, or click to browse. Supports PDF, DOCX, TXT, and
          Markdown up to 20 MB.
        </p>

        {uploading ? (
          <div className="w-full max-w-md mt-2">
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <span>{isProcessing ? 'Processing & generating embeddings...' : 'Uploading file...'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-indigo-600'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">
              {isProcessing
                ? 'Parsing document text, splitting into chunks and generating vector embeddings...'
                : 'Transferring data to server...'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              type="button"
              variant="primary"
              size="md"
              icon={FileText}
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              Max 20MB per document
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
