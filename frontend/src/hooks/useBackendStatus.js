import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const cleanBaseUrl = rawBaseUrl.replace(/\/$/, '');

export function useBackendStatus() {
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(false);
  const timerRef = useRef(null);

  const checkHealth = useCallback(async () => {
    // If mock mode is explicitly turned on, backend status is simulated as online
    if (import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.VITE_USE_MOCK === true) {
      setOnline(true);
      return true;
    }

    setChecking(true);
    try {
      // Try /health at root or /api/health
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      try {
        await axios.get(`${cleanBaseUrl}/api/health`, {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        setOnline(true);
        return true;
      } catch (err) {
        // Fallback to /health without /api prefix
        if (err.response?.status === 404) {
          await axios.get(`${cleanBaseUrl}/health`, {
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          setOnline(true);
          return true;
        }
        throw err;
      }
    } catch (err) {
      setOnline(false);
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  // Poll every 30s when online, and every 5s when offline
  useEffect(() => {
    checkHealth();

    const intervalMs = online ? 30000 : 5000;
    timerRef.current = setInterval(checkHealth, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [online, checkHealth]);

  return {
    online,
    checking,
    retry: checkHealth,
    baseUrl: cleanBaseUrl,
  };
}

export default useBackendStatus;
