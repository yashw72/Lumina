import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Sun, Moon, ChevronDown, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem('documentor.theme') === 'dark' ||
      (!('documentor.theme' in localStorage) &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('documentor.theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('documentor.theme', 'light');
    }
  };

  // Close on outside click and Escape key
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  // Compute initials (e.g. "Yash W" -> "YW", "John" -> "J")
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="User account menu"
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac-500/30 group"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-lilac-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-white/20 select-none">
          {initials}
        </div>
        <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-semibold text-ink dark:text-white">
          {user.name.split(' ')[0]}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            role="menu"
            className="absolute right-0 mt-2 w-64 rounded-2xl glass p-2 border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-ink/95 shadow-xl shadow-slate-300/40 dark:shadow-black/60 backdrop-blur-xl z-50 text-xs text-ink dark:text-white focus:outline-none"
          >
            {/* Header: User Info */}
            <div className="px-3 py-2.5 border-b border-black/5 dark:border-white/5 mb-1">
              <div className="font-bold text-sm text-ink dark:text-white truncate">{user.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                Signed in as <span className="font-semibold text-ink dark:text-white">{user.email}</span>
              </div>
            </div>

            {/* Theme Toggle row */}
            <button
              type="button"
              role="menuitem"
              onClick={toggleDarkMode}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus:outline-none focus:bg-black/5 dark:focus:bg-white/5"
            >
              <div className="flex items-center gap-2.5">
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {darkMode ? 'Light mode' : 'Dark mode'}
                </span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 font-mono">
                {darkMode ? 'DARK' : 'LIGHT'}
              </span>
            </button>

            {/* Divider */}
            <div className="h-px bg-black/5 dark:bg-white/5 my-1" />

            {/* Logout button (danger style) */}
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors focus:outline-none focus:bg-red-50 dark:focus:bg-red-950/40 font-semibold"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
