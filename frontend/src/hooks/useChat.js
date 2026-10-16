import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { sendMessage, getHistory } from '../api/chat.js';

const STORAGE_KEY = 'documentor.chat';

export function useChat(selectedDocIds = []) {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.sessionId === 'session-sample-1') {
          localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        return parsed.sessionId || null;
      }
    } catch (_) {}
    return null;
  });

  const abortControllerRef = useRef(null);

  // Restore chat history if sessionId exists
  useEffect(() => {
    let isMounted = true;

    async function restoreHistory() {
      if (!sessionId) return;
      try {
        const historyData = await getHistory(sessionId);
        if (isMounted && historyData && Array.isArray(historyData.messages)) {
          setMessages(
            historyData.messages.map((m) => ({
              role: m.role,
              content: m.content,
              sources: m.sources || [],
              image_url: m.image_url || null,
              created_at: m.created_at || new Date().toISOString(),
            }))
          );
        }
      } catch (err) {
        // If session not found or 404, silently reset session
        if (isMounted) {
          setSessionId(null);
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (_) {}
        }
      }
    }

    if (sessionId && messages.length === 0) {
      restoreHistory();
    }

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [sessionId]);

  // Persist session to localStorage
  const saveSessionState = (newSessionId, docIds) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          sessionId: newSessionId,
          documentIds: docIds,
        })
      );
    } catch (_) {}
  };

  const send = useCallback(
    async (question, options = {}) => {
      const cleanQuestion = question?.trim();
      if (!cleanQuestion || sending) return false;

      const isImage = Boolean(options.isImage);

      // Add user message immediately
      const userMessage = {
        role: 'user',
        content: cleanQuestion,
        sources: [],
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setSending(true);

      try {
        const response = await sendMessage({
          question: cleanQuestion,
          documentIds: selectedDocIds,
          sessionId: sessionId,
          isImage: isImage,
        });

        const newSessionId = response.session_id || sessionId;
        setSessionId(newSessionId);
        saveSessionState(newSessionId, selectedDocIds);

        const assistantMessage = {
          role: 'assistant',
          content: response.answer,
          sources: response.sources || [],
          image_url: response.image_url || null,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        return true;
      } catch (err) {
        toast.error(err.message || 'Failed to send question');
        return false;
      } finally {
        setSending(false);
      }
    },
    [sending, selectedDocIds, sessionId]
  );

  const newChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (_) {}
  }, []);

  return {
    messages,
    sending,
    sessionId,
    send,
    newChat,
  };
}

export default useChat;
