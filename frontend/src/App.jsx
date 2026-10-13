import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import StudyPage from './pages/StudyPage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur px-6 py-4 flex gap-6">
        <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-700">Home</Link>
        <Link to="/chat" className="text-slate-600 hover:text-slate-900 dark:text-slate-300">Chat</Link>
        <Link to="/study" className="text-slate-600 hover:text-slate-900 dark:text-slate-300">Study</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/study" element={<StudyPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
