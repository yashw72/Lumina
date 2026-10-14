import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpenText,
  Files,
  MessageSquare,
  GraduationCap,
  Sun,
  Moon,
  Menu,
  X,
  Upload,
  ArrowRight,
} from 'lucide-react';
import Button from '../common/Button.jsx';
import IconButton from '../common/IconButton.jsx';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem('documentor.theme') === 'dark' ||
      (!('documentor.theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('documentor.theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('documentor.theme', 'light');
    }
  }, [darkMode]);

  // Track scroll position for shadow enhancement
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home', icon: Files },
    { to: '/chat', label: 'Chat', icon: MessageSquare },
    { to: '/study', label: 'Study', icon: GraduationCap },
  ];

  const handleUploadClick = () => {
    if (location.pathname !== '/') {
      navigate('/#upload');
    } else {
      const el = document.getElementById('upload');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-4 z-40 w-full px-4 sm:px-6 max-w-6xl mx-auto">
      <div
        className={`glass rounded-full px-4 sm:px-6 py-2.5 transition-all duration-300 ${
          scrolled ? 'shadow-xl shadow-lilac-500/10 dark:shadow-black/40 border-black/10' : 'shadow-md'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Title */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none rounded-full"
            aria-label="DocuMentor AI Home"
          >
            <div className="w-9 h-9 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <BookOpenText className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-ink dark:text-white">
                DocuMentor
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-lilac-100 text-lilac-700 dark:bg-lilac-950 dark:text-lilac-300">
                AI
              </span>
            </div>
          </NavLink>

          {/* Center: Desktop Navigation with sliding pill indicator */}
          <nav className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-full">
            {navLinks.map(({ to, label }) => {
              const isActive =
                to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(to);

              return (
                <NavLink
                  key={to}
                  to={to}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 select-none ${
                    isActive
                      ? 'text-white dark:text-ink'
                      : 'text-slate-600 dark:text-slate-400 hover:text-ink dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activePill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 bg-ink dark:bg-white rounded-full z-0 shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right: Theme Toggle + Upload Pill Button + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <IconButton
              icon={darkMode ? Sun : Moon}
              variant="white"
              size="sm"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setDarkMode(!darkMode)}
              className="text-slate-700 dark:text-slate-300"
            />

            <Button
              variant="primary"
              size="sm"
              hideArrow={false}
              onClick={handleUploadClick}
              className="hidden sm:inline-flex"
            >
              Upload
            </Button>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full text-ink dark:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden overflow-hidden pt-3 pb-2 border-t border-black/5 dark:border-white/5 mt-2 flex flex-col gap-1.5"
            >
              {navLinks.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-ink text-white dark:bg-white dark:text-ink'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              ))}

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleUploadClick}
                  className="w-full justify-between"
                >
                  Upload New Document
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
