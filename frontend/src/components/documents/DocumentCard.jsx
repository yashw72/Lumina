import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  ArrowRight,
} from 'lucide-react';
import Button from '../common/Button.jsx';
import IconButton from '../common/IconButton.jsx';
import Badge from '../common/Badge.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

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
        return <FileCode className="w-6 h-6 text-lilac-600 dark:text-lilac-400" />;
      case 'txt':
        return <File className="w-6 h-6 text-emerald-500" />;
      default:
        return <File className="w-6 h-6 text-slate-500" />;
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
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{
          y: -4,
          boxShadow: '0 20px 40px -15px rgba(168, 85, 247, 0.25)',
        }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-card p-6 bg-gradient-to-br from-lilac-50/90 via-white to-lilac-100/60 dark:from-ink-soft dark:via-[#14141A] dark:to-lilac-950/20 border border-lilac-200/80 dark:border-white/10 shadow-card flex flex-col justify-between relative group"
      >
        <div>
          {/* Top Row: File Type Icon Box + Status Badge */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="w-13 h-13 rounded-2xl bg-white dark:bg-ink p-3 flex items-center justify-center shadow-md border border-black/5 dark:border-white/10 shrink-0">
              {getFileIcon(doc.file_type)}
            </div>

            <div className="flex items-center gap-2">
              <Badge status={doc.status} />
              <IconButton
                icon={Trash2}
                variant="danger"
                size="sm"
                aria-label={`Delete ${doc.filename}`}
                onClick={() => setShowConfirmDelete(true)}
              />
            </div>
          </div>

          {/* Title with truncation and tooltip */}
          <h3
            className="font-bold text-ink dark:text-white text-base leading-snug line-clamp-1 mb-2 group-hover:text-lilac-700 dark:group-hover:text-lilac-300 transition-colors"
            title={doc.filename}
          >
            {doc.filename}
          </h3>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-5 bg-white/70 dark:bg-black/30 p-3 rounded-2xl border border-black/5 dark:border-white/5">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>{doc.page_count ?? 1} {doc.page_count === 1 ? 'Page' : 'Pages'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{doc.chunk_count ?? 0} Chunks</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-black/5 dark:border-white/5 text-[11px] text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Added {formatDate(doc.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Footer Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            disabled={!isReady}
            onClick={() => navigate(`/chat?doc=${doc.id}`)}
          >
            Chat
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={!isReady}
            onClick={() => navigate(`/study?doc=${doc.id}`)}
          >
            Study
          </Button>
        </div>
      </motion.div>

      {/* Accessible ConfirmDialog Component */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Delete this document?"
        description={`Are you sure you want to remove "${doc.filename}"? Its knowledge chunks and vector embeddings will be permanently erased.`}
        confirmText="Delete Document"
        confirmVariant="danger"
        loading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setShowConfirmDelete(false)}
      />
    </>
  );
}
