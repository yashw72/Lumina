import React from 'react';
import { motion } from 'framer-motion';

export default function Card({
  children,
  variant = 'white',
  hoverable = false,
  className = '',
  ...props
}) {
  const baseStyles = 'rounded-card p-6 sm:p-7 relative transition-all duration-200';

  const variants = {
    white:
      'bg-white dark:bg-ink-soft text-ink dark:text-white border border-black/8 dark:border-white/10 shadow-card',
    lilac:
      'bg-gradient-to-br from-lilac-50 via-lilac-100/70 to-lilac-200/50 dark:from-lilac-950/40 dark:to-slate-900 border border-lilac-200/70 dark:border-lilac-800/40 text-ink dark:text-white shadow-card',
    dark:
      'bg-ink text-white dark:bg-[#15151B] border border-white/10 shadow-2xl overflow-hidden',
    orange:
      'bg-gradient-to-br from-accent-orange to-accent-deepOrange text-white shadow-orange-glow',
    cream:
      'bg-cream text-ink dark:bg-ink-soft dark:text-white border border-black/6 dark:border-white/10 shadow-card',
  };

  const Component = hoverable ? motion.div : 'div';
  const hoverProps = hoverable
    ? {
        whileHover: { y: -4, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } },
      }
    : {};

  return (
    <Component
      className={`${baseStyles} ${variants[variant] || variants.white} ${hoverable ? 'hover:shadow-card-hover' : ''} ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </Component>
  );
}
