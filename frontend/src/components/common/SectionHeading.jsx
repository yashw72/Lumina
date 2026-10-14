import React from 'react';
import { Sparkles } from 'lucide-react';

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = true,
  className = '',
  eyebrowIcon: EyebrowIcon = Sparkles,
}) {
  return (
    <div
      className={`space-y-3 ${
        centered ? 'text-center max-w-2xl mx-auto' : 'text-left max-w-xl'
      } ${className}`}
    >
      {eyebrow && (
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lilac-100/80 dark:bg-lilac-950/60 border border-lilac-200/80 dark:border-lilac-800/60 text-lilac-700 dark:text-lilac-300 text-xs font-bold tracking-tight shadow-2xs ${
            centered ? 'mx-auto' : ''
          }`}
        >
          {EyebrowIcon && <EyebrowIcon className="w-3.5 h-3.5 text-lilac-600 dark:text-lilac-400" />}
          <span>{eyebrow}</span>
        </div>
      )}

      {title && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink dark:text-white tracking-tight leading-tight">
          {title}
        </h2>
      )}

      {subtitle && (
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
