import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { listDocuments, deleteDocument } from '../api/documents.js';

export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listDocuments();
      setDocuments(data.documents || []);
    } catch (err) {
      const errMsg = err.message || 'Failed to load documents';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(
    async (id) => {
      try {
        await deleteDocument(id);
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        toast.success('Document deleted successfully');

        // Also clean up any persisted chat selection for this doc (INT-2 requirement)
        try {
          const stored = localStorage.getItem('documentor.chat');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.documentIds)) {
              parsed.documentIds = parsed.documentIds.filter((dId) => dId !== id);
              localStorage.setItem('documentor.chat', JSON.stringify(parsed));
            }
          }
        } catch (_) {}

        return true;
      } catch (err) {
        toast.error(err.message || 'Failed to delete document');
        return false;
      }
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    documents,
    loading,
    error,
    refresh,
    remove,
  };
}

export default useDocuments;
