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
} from 'lucide-react';
import Button from '../common/Button.jsx';
import IconButton from '../common/IconButton.jsx';
import UserMenu from './UserMenu.jsx';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <header className="sticky top-3 sm:top-4 z-40 w-full px-2 sm:px-6 max-w-6xl mx-auto">
      <div
        className={`glass rounded-full px-4 sm:px-6 py-2.5 transition-all duration-300 ${
          scrolled
            ? 'shadow-xl shadow-lilac-500/10 dark:shadow-black/50 border-black/10 dark:border-white/10'
            : 'shadow-md border-black/5 dark:border-white/5'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Title with slight rotation on hover */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group focus:outline-none rounded-full"
            aria-label="DocuMentor AI Home"
          >
            <motion.div
              whileHover={{ rotate: 12, scale: 1.06 }}
              transition={{ duration: 0.2 }}
              className="w-9 h-9 rounded-full bg-ink text-white dark:bg-white dark:text-ink flex items-center justify-center shadow-sm"
            >
              <BookOpenText className="w-4 h-4 stroke-[2.2]" />
            </motion.div>
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

          {/* Right: Theme Toggle with Rotate Morph + Upload Pill + Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <IconButton
              icon={() => (
                <motion.div
                  key={darkMode ? 'dark' : 'light'}
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ duration: 0.25 }}
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-700" />
                  )}
                </motion.div>
              )}
              variant="white"
              size="sm"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={() => setDarkMode(!darkMode)}
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

            {/* User Profile Dropdown Menu */}
            <UserMenu />

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
                    `flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors ${
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

              {/* Mobile User Profile & Logout section */}
              {user && (
                <div className="pt-3 mt-1 border-t border-black/5 dark:border-white/5 flex items-center justify-between px-2 py-1">
                  <div className="truncate text-xs pr-2">
                    <p className="font-bold text-ink dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                      navigate('/login', { replace: true });
                    }}
                    className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 shrink-0"
                  >
                    Log out
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
