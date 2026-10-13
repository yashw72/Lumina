import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  MessageSquare,
  GraduationCap,
  Files,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem('documentor_theme') === 'dark' ||
      (!('documentor_theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('documentor_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('documentor_theme', 'light');
    }
  }, [darkMode]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Documents', icon: Files },
    { to: '/chat', label: 'Chat', icon: MessageSquare },
    { to: '/study', label: 'Study Tools', icon: GraduationCap },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30 group-hover:scale-105 transition-all duration-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  DocuMentor
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                  AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium -mt-1 hidden sm:inline">
                RAG Learning Assistant
              </span>
            </div>
          </NavLink>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Action Icons: Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 px-2 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
