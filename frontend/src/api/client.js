import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const baseURL = rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/$/, '')}/api`;

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to normalize error handling
apiClient.interceptors.response.use(
  (response) => {
    // Dev-only contract guard
    if (import.meta.env.DEV && response.data && typeof response.data === 'object') {
      const url = response.config.url || '';
      if (url.includes('/documents') && response.config.method === 'get' && !url.match(/\/documents\/\d+/)) {
        if (!Array.isArray(response.data.documents)) {
          console.warn('[Contract Guard] GET /documents response missing "documents" array:', response.data);
        }
      }
      if (url.includes('/chat') && response.config.method === 'post') {
        if (!response.data.answer || !Array.isArray(response.data.sources)) {
          console.warn('[Contract Guard] POST /chat response missing "answer" or "sources":', response.data);
        }
      }
    }
    return response;
  },
  (error) => {
    const customError = new Error();

    if (error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'))) {
      customError.message = 'This is taking longer than usual, please try again.';
      customError.status = 408;
      customError.isNetwork = true;
    } else if (error.response) {
      customError.status = error.response.status;
      customError.isNetwork = false;
      const detail = error.response.data?.detail;

      if (Array.isArray(detail)) {
        // Handle FastAPI 422 validation error array [{ loc: [...], msg: "..." }]
        const formatted = detail
          .map((item) => {
            const field = Array.isArray(item.loc) ? item.loc.slice(1).join('.') : 'field';
            return `${field ? field + ': ' : ''}${item.msg || 'invalid'}`;
          })
          .join(', ');
        customError.message = formatted || 'Validation error on server';
      } else if (typeof detail === 'string') {
        customError.message = detail;
      } else if (detail && typeof detail === 'object') {
        customError.message = detail.message || JSON.stringify(detail);
      } else {
        customError.message = error.response.statusText || `Request failed with status ${error.response.status}`;
      }
    } else {
      customError.message = 'Cannot reach the server. Please check your backend connection.';
      customError.status = 0;
      customError.isNetwork = true;
    }

    return Promise.reject(customError);
  }
);

export const isMockEnabled = () => {
  const envVal = import.meta.env.VITE_USE_MOCK;
  return envVal === 'true' || envVal === true;
};

export default apiClient;
