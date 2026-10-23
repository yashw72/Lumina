/**
 * Safe token storage utility with in-memory fallback.
 * Uses localStorage key "documentor_token" as specified in Chunk 3.
 */

const TOKEN_KEY = 'documentor_token';
const USER_KEY = 'documentor_user';

let inMemoryToken = null;
let inMemoryUser = null;

export const tokenStore = {
  getToken: () => {
    try {
      const stored = localStorage.getItem(TOKEN_KEY);
      if (stored) return stored;
    } catch {
      // localStorage unavailable or restricted
    }
    return inMemoryToken;
  },

  getUser: () => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // localStorage unavailable or invalid json
    }
    return inMemoryUser;
  },

  setUser: (user) => {
    inMemoryUser = user;
    try {
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      // localStorage write error fallback
    }
  },

  setToken: (token) => {
    inMemoryToken = token;
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // localStorage write error fallback
    }
  },

  clearToken: () => {
    inMemoryToken = null;
    inMemoryUser = null;
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      // localStorage clear error fallback
    }
  },
};

export default tokenStore;
