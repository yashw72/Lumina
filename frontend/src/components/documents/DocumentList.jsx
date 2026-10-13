import React from 'react';
import DocumentCard from './DocumentCard.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Loader from '../common/Loader.jsx';
import { Files } from 'lucide-react';

export default function DocumentList({ documents, loading, onDelete }) {
  if (loading) {
    return (
      <div className="py-12">
        <Loader size="lg" message="Loading your document library..." />
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        icon={Files}
        title="Your library is empty"
        description="Upload your first textbook, study notes, or assignment above to get started with AI chat and study aids."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <DocumentCard key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}
