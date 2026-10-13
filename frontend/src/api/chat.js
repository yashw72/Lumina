import apiClient, { isMockEnabled } from './client.js';
import { mockApi } from './mock.js';

/**
 * Send a question to RAG chat
 * @param {Object} params
 * @param {string} params.question
 * @param {Array<number>} [params.documentIds]
 * @param {string|null} [params.sessionId]
 * @returns {Promise<{session_id: string, answer: string, sources: Array<{document_id: number, filename: string, page: number, snippet: string, score: number}>}>}
 */
export async function sendMessage({ question, documentIds = [], sessionId = null }) {
  const payload = {
    question: question?.trim(),
    document_ids: documentIds && documentIds.length > 0 ? documentIds : [],
    session_id: sessionId || null,
  };

  if (isMockEnabled()) {
    return mockApi.sendMessage({
      question: payload.question,
      document_ids: payload.document_ids,
      session_id: payload.session_id,
    });
  }

  const response = await apiClient.post('/chat', payload, {
    timeout: 60000, // 60s for LLM retrieval and generation
  });
  return response.data;
}

/**
 * Fetch chat message history for a given session
 * @param {string} sessionId
 * @returns {Promise<{session_id: string, messages: Array<{role: string, content: string, sources: Array<any>, created_at: string}>}>}
 */
export async function getHistory(sessionId) {
  if (!sessionId) {
    return { session_id: null, messages: [] };
  }

  if (isMockEnabled()) {
    return mockApi.getHistory(sessionId);
  }

  const response = await apiClient.get(`/chat/history/${encodeURIComponent(sessionId)}`);
  return response.data;
}
