import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { tokenStore } from '../lib/tokenStore';
import { signup as apiSignup, login as apiLogin, getMe as apiGetMe } from '../api/auth';
import { setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => tokenStore.getToken());
  const [user, setUser] = useState(() => tokenStore.getUser());
  const [loading, setLoading] = useState(true);

  // Logout clears all stored session data
  const logout = useCallback((isExpired = false) => {
    const currentUserId = user?.id;
    tokenStore.clearToken();
    setToken(null);
    setUser(null);

    // Clean up per-user storage items
    if (currentUserId) {
      try {
        localStorage.removeItem(`documentor_chat_session_${currentUserId}`);
      } catch {
        // ignore
      }
    }
    try {
      localStorage.removeItem('documentor_chat_session');
      localStorage.removeItem('documentor.chat');
    } catch {
      // ignore
    }

    if (isExpired) {
      toast.error('Your session expired. Please log in again.');
    } else {
      toast.success('You have been logged out');
    }
  }, [user]);

  // Hook into client.js 401 response interceptor
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout(true);
    });
  }, [logout]);

  // Validate existing token on initial mount
  useEffect(() => {
    let isMounted = true;

    async function validateToken() {
      const existingToken = tokenStore.getToken();
      if (!existingToken) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const userData = await apiGetMe();
        if (isMounted) {
          setUser(userData);
          tokenStore.setUser(userData);
          setToken(existingToken);
        }
      } catch (err) {
        // Only an actual 401/403/404 logs out.
        // If the backend is offline (network error), preserve token and cached user
        // so the user sees the page with BackendBanner rather than getting logged out.
        if (err.status === 401 || err.status === 403 || err.status === 404) {
          tokenStore.clearToken();
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    validateToken();

    return () => {
      isMounted = false;
    };
  }, []);

  const signup = async (data) => {
    const result = await apiSignup(data);
    tokenStore.setToken(result.accessToken);
    tokenStore.setUser(result.user);
    setToken(result.accessToken);
    setUser(result.user);
    return result;
  };

  const login = async (data) => {
    const result = await apiLogin(data);
    tokenStore.setToken(result.accessToken);
    tokenStore.setUser(result.user);
    setToken(result.accessToken);
    setUser(result.user);
    return result;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
