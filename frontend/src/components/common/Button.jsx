import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  hideArrow = false,
  className = '',
  to,
  as,
  type = 'button',
  onClick,
  ...props
}) {
  const isLink = Boolean(to);
  const Component = isLink ? motion(Link) : motion.button;

  // Base pill styling with Plus Jakarta Sans and rounded-full
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-full select-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-lilac-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-ink hover:bg-ink-soft text-white dark:bg-white dark:text-ink dark:hover:bg-slate-200 shadow-md group',
    secondary:
      'bg-white dark:bg-ink-soft text-ink dark:text-white border border-black/10 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-2xs',
    accent:
      'bg-accent-orange hover:bg-accent-deepOrange text-white shadow-orange-glow',
    outline:
      'bg-transparent border border-black/15 dark:border-white/20 text-ink dark:text-white hover:bg-black/5 dark:hover:bg-white/5',
    ghost:
      'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm',
  };

  const sizes = {
    sm: 'text-xs pl-3.5 pr-2 py-1.5 gap-2 h-9',
    md: 'text-sm pl-5 pr-2.5 py-2 gap-3 h-12',
    lg: 'text-base pl-6 pr-3 py-2.5 gap-3.5 h-14',
  };

  // If hideArrow or non-primary, use standard padding
  const paddingAdjustment =
    hideArrow || variant !== 'primary'
      ? size === 'sm'
        ? 'px-4'
        : size === 'lg'
        ? 'px-6'
        : 'px-5'
      : '';

  const motionProps = {
    whileHover: disabled || loading ? {} : { y: -2, scale: 1.01 },
    whileTap: disabled || loading ? {} : { scale: 0.97 },
  };

  const arrowSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-9 h-9',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}

      <span className="truncate">{children}</span>

      {/* Signature black-pill white-arrow circle */}
      {variant === 'primary' && !hideArrow && !loading && (
        <span
          className={`${arrowSizes[size] || arrowSizes.md} rounded-full bg-white text-ink dark:bg-ink dark:text-white flex items-center justify-center shrink-0 ml-1 transition-transform duration-200 group-hover:translate-x-1 shadow-2xs`}
        >
          <ArrowRight className={`${iconSizes[size] || iconSizes.md} stroke-[2.5]`} />
        </span>
      )}
    </>
  );

  if (isLink) {
    return (
      <Component
        to={to}
        className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${paddingAdjustment} ${className}`}
        {...motionProps}
        {...props}
      >
        {content}
      </Component>
    );
  }

  return (
    <Component
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${paddingAdjustment} ${className}`}
      {...motionProps}
      {...props}
    >
      {content}
    </Component>
  );
}
