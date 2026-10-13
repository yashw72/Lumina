import apiClient, { isMockEnabled } from './client.js';
import { mockApi } from './mock.js';

/**
 * Upload a study document (.pdf, .docx, .txt, .md, max 20MB)
 * @param {File} file
 * @param {Function} [onProgress] - Progress callback (percentage: 0 - 100)
 * @returns {Promise<{id: number, filename: string, file_type: string, page_count: number, chunk_count: number, status: string, created_at: string}>}
 */
export async function uploadDocument(file, onProgress) {
  if (isMockEnabled()) {
    return mockApi.uploadDocument(file, onProgress);
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 120000, // 120s for ingestion and embedding
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
}

/**
 * List all uploaded documents
 * @returns {Promise<{documents: Array<{id: number, filename: string, file_type: string, page_count: number, chunk_count: number, status: string, created_at: string}>}>}
 */
export async function listDocuments() {
  if (isMockEnabled()) {
    return mockApi.listDocuments();
  }

  const response = await apiClient.get('/documents');
  return response.data;
}

/**
 * Get single document details by ID
 * @param {number|string} id
 */
export async function getDocument(id) {
  if (isMockEnabled()) {
    const list = await mockApi.listDocuments();
    return list.documents.find((d) => d.id === Number(id)) || null;
  }

  const response = await apiClient.get(`/documents/${id}`);
  return response.data;
}

/**
 * Delete a document and its embeddings by ID
 * @param {number|string} id
 * @returns {Promise<{message: string}>}
 */
export async function deleteDocument(id) {
  if (isMockEnabled()) {
    return mockApi.deleteDocument(id);
  }

  const response = await apiClient.delete(`/documents/${id}`);
  return response.data;
}
