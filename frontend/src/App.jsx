import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import PageTransition from './components/common/PageTransition';
import Loader from './components/common/Loader';

// Code-split / lazy load secondary routes for high performance & smaller main bundle
const ChatPage = lazy(() => import('./pages/ChatPage'));
const StudyPage = lazy(() => import('./pages/StudyPage'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader size="lg" message="Loading page..." />}>
        <Routes location={location} key={location.pathname}>
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
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </BrowserRouter>
  );
}
