import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  File,
  MessageSquare,
  GraduationCap,
  Trash2,
  Calendar,
  Layers,
  BookOpen,
  AlertTriangle,
  X,
} from 'lucide-react';
import Button from '../common/Button.jsx';

export default function DocumentCard({ document: doc, onDelete }) {
  const navigate = useNavigate();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-6 h-6 text-rose-500" />;
      case 'docx':
      case 'doc':
        return <FileSpreadsheet className="w-6 h-6 text-blue-500" />;
      case 'md':
      case 'markdown':
        return <FileCode className="w-6 h-6 text-violet-500" />;
      case 'txt':
        return <File className="w-6 h-6 text-emerald-500" />;
      default:
        return <File className="w-6 h-6 text-slate-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Ready
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Processing
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Just now';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Recently';
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(doc.id);
    setIsDeleting(false);
    setShowConfirmDelete(false);
  };

  const isReady = doc.status === 'ready';

  return (
    <div className="relative group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 rounded-2xl p-5 hover:border-indigo-300 dark:hover:border-indigo-600/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top Header: Icon, Status, and Delete button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shrink-0 shadow-inner">
            {getFileIcon(doc.file_type)}
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(doc.status)}
            <button
              type="button"
              onClick={() => setShowConfirmDelete(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors focus:outline-none"
              title="Delete document"
              aria-label={`Delete ${doc.filename}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <h3
          className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-1 mb-2"
          title={doc.filename}
        >
          {doc.filename}
        </h3>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>{doc.page_count ?? 1} {doc.page_count === 1 ? 'Page' : 'Pages'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>{doc.chunk_count ?? 0} Chunks</span>
          </div>
          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Uploaded {formatDate(doc.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <Button
          variant="primary"
          size="sm"
          className="flex-1"
          icon={MessageSquare}
          disabled={!isReady}
          onClick={() => navigate(`/chat?doc=${doc.id}`)}
        >
          Chat
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="flex-1"
          icon={GraduationCap}
          disabled={!isReady}
          onClick={() => navigate(`/study?doc=${doc.id}`)}
        >
          Study
        </Button>
      </div>

      {/* Confirmation Modal Overlay */}
      {showConfirmDelete && (
        <div className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs rounded-2xl p-5 z-20 flex flex-col justify-center items-center text-center animate-in fade-in duration-150 border border-rose-200 dark:border-rose-900/50">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
            Delete this document?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-xs line-clamp-2">
            Are you sure you want to remove <span className="font-semibold text-slate-700 dark:text-slate-300">"{doc.filename}"</span>? Its vector index will be deleted.
          </p>
          <div className="flex items-center gap-2 w-full max-w-xs">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              disabled={isDeleting}
              onClick={() => setShowConfirmDelete(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              loading={isDeleting}
              onClick={handleDelete}
            >
              Confirm
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
