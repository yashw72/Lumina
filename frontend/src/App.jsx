import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PageTransition from './components/common/PageTransition';
import Loader from './components/common/Loader';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

// Code-split / lazy load secondary routes for high performance & smaller main bundle
const ChatPage = lazy(() => import('./pages/ChatPage'));
const StudyPage = lazy(() => import('./pages/StudyPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader size="lg" message="Loading page..." />}>
        <Routes location={location} key={location.pathname}>
          {/* Public routes without Layout */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <PageTransition>
                  <SignupPage />
                </PageTransition>
              </PublicRoute>
            }
          />

          {/* Protected routes wrapped in ProtectedRoute and Layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route
              path="/"
              element={
                <PageTransition>
                  <HomePage />
                </PageTransition>
              }
            />
            <Route
              path="/chat"
              element={
                <PageTransition>
                  <ChatPage />
                </PageTransition>
              }
            />
            <Route
              path="/study"
              element={
                <PageTransition>
                  <StudyPage />
                </PageTransition>
              }
            />
            {/* Navigation aliases & shortcuts */}
            <Route path="/library" element={<Navigate to="/" replace />} />
            <Route path="/flashcards" element={<Navigate to="/study?tab=flashcards" replace />} />
            <Route path="/summary" element={<Navigate to="/study?tab=summary" replace />} />
            <Route path="/quiz" element={<Navigate to="/study?tab=quiz" replace />} />
            <Route path="/study/flashcards" element={<Navigate to="/study?tab=flashcards" replace />} />
            <Route path="/study/quiz" element={<Navigate to="/study?tab=quiz" replace />} />
            <Route path="/study/summary" element={<Navigate to="/study?tab=summary" replace />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className:
            '!rounded-full !px-5 !py-3 !bg-ink !text-white dark:!bg-white dark:!text-ink !shadow-xl !font-semibold !text-xs !border !border-white/10',
          success: {
            iconTheme: {
              primary: '#A855F7',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
