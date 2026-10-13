import apiClient, { isMockEnabled } from './client.js';
import { mockApi } from './mock.js';

/**
 * Generate AI study summary for a document
 * @param {number|string} documentId
 * @returns {Promise<{document_id: number, summary: string}>}
 */
export async function getSummary(documentId) {
  const payload = { document_id: Number(documentId) };

  if (isMockEnabled()) {
    return mockApi.getSummary(payload.document_id);
  }

  const response = await apiClient.post('/study/summary', payload, {
    timeout: 90000,
  });
  return response.data;
}

/**
 * Generate AI flashcards for a document
 * @param {number|string} documentId
 * @param {number} [count=10]
 * @returns {Promise<{document_id: number, flashcards: Array<{question: string, answer: string}>}>}
 */
export async function getFlashcards(documentId, count = 10) {
  const payload = {
    document_id: Number(documentId),
    count: Number(count) || 10,
  };

  if (isMockEnabled()) {
    return mockApi.getFlashcards(payload.document_id, payload.count);
  }

  const response = await apiClient.post('/study/flashcards', payload, {
    timeout: 90000,
  });
  return response.data;
}

/**
 * Generate AI multiple-choice quiz questions for a document
 * @param {number|string} documentId
 * @param {number} [count=5]
 * @returns {Promise<{document_id: number, questions: Array<{question: string, options: string[], correct_index: number, explanation: string}>}>}
 */
export async function getQuiz(documentId, count = 5) {
  const payload = {
    document_id: Number(documentId),
    count: Number(count) || 5,
  };

  if (isMockEnabled()) {
    return mockApi.getQuiz(payload.document_id, payload.count);
  }

  const response = await apiClient.post('/study/quiz', payload, {
    timeout: 90000,
  });
  return response.data;
}
