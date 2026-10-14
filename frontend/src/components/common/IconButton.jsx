import React from 'react';
import { motion } from 'framer-motion';

export default function IconButton({
  icon: Icon,
  variant = 'white',
  size = 'md',
  'aria-label': ariaLabel,
  onClick,
  disabled = false,
  className = '',
  ...props
}) {
  if (!ariaLabel) {
    console.warn('[Accessibility] IconButton requires a descriptive aria-label prop.');
  }

  const baseStyles =
    'inline-flex items-center justify-center rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-lilac-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none shrink-0 shadow-sm';

  const variants = {
    orange:
      'bg-accent-orange text-white hover:bg-accent-deepOrange shadow-orange-glow',
    white:
      'bg-white dark:bg-ink-soft text-ink dark:text-white border border-black/10 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs',
    dark:
      'bg-ink text-white hover:bg-ink-soft dark:bg-white dark:text-ink shadow-sm',
    ghost:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5',
    danger:
      'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200/60 dark:border-rose-800/60',
  };

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      whileHover={disabled ? {} : { scale: 1.06, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.94 }}
      className={`${baseStyles} ${variants[variant] || variants.white} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size] || iconSizes.md} />}
    </motion.button>
  );
}
