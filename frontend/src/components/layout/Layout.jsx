import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BackendBanner from '../common/BackendBanner';
import { useBackendStatus } from '../../hooks/useBackendStatus';

export default function Layout({ children }) {
  const { online, checking, retry, baseUrl } = useBackendStatus();

  return (
    <div className="min-h-screen bg-lilac-50 dark:bg-ink text-ink dark:text-slate-100 transition-colors duration-200 relative overflow-hidden py-3 sm:py-6 px-2 sm:px-5 flex flex-col justify-between">
      {/* Background Floating Blobs */}
      <div
        aria-hidden="true"
        className="fixed top-12 left-10 w-96 h-96 rounded-full bg-lilac-300/40 dark:bg-lilac-900/20 blur-3xl pointer-events-none animate-blob -z-10"
      />
      <div
        aria-hidden="true"
        className="fixed top-64 right-12 w-96 h-96 rounded-full bg-accent-orange/15 dark:bg-accent-orange/10 blur-3xl pointer-events-none animate-blob [animation-delay:4s] -z-10"
      />

      {/* Connectivity Banner */}
      <BackendBanner
        online={online}
        checking={checking}
        retry={retry}
        baseUrl={baseUrl}
      />

      {/* Main Large Rounded Cream Shell Card */}
      <div className="w-full max-w-[1440px] mx-auto bg-cream dark:bg-ink-soft rounded-shell border border-black/8 dark:border-white/10 shadow-2xl flex-1 flex flex-col relative transition-colors duration-200 overflow-hidden">
        {/* Floating Navbar */}
        <Navbar />

        {/* Content Viewport */}
        <main id="main-content" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {children}
        </main>

        {/* Footer */}
        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          <Footer />
        </div>
      </div>
    </div>
  );
}
