import React from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordStrength({ password = '' }) {
  const hasMinLength = password.length >= 8 && password.length <= 72;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);

  const passedCount = [hasMinLength, hasLetter, hasNumber].filter(Boolean).length;

  let strengthLabel = 'Too weak';
  let barColor = 'bg-red-500';
  let barWidth = 'w-1/3';

  if (passedCount === 3) {
    strengthLabel = 'Strong';
    barColor = 'bg-emerald-500';
    barWidth = 'w-full';
  } else if (passedCount === 2) {
    strengthLabel = 'Fair';
    barColor = 'bg-amber-500';
    barWidth = 'w-2/3';
  }

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2 text-xs">
      {/* Progress Bar & Label */}
      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <span>Password strength:</span>
        <span
          className={
            passedCount === 3
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : passedCount === 2
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-red-500'
          }
        >
          {strengthLabel}
        </span>
      </div>

      <div className="w-full h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full transition-all duration-300 rounded-full ${barWidth} ${barColor}`} />
      </div>

      {/* Rules Checklist */}
      <ul className="grid grid-cols-1 sm:grid-cols-3 gap-1 pt-1 text-[11px] text-slate-600 dark:text-slate-400">
        <li className="flex items-center gap-1.5">
          {hasMinLength ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
          )}
          <span className={hasMinLength ? 'text-ink dark:text-white font-medium' : ''}>8+ characters</span>
        </li>
        <li className="flex items-center gap-1.5">
          {hasLetter ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
          )}
          <span className={hasLetter ? 'text-ink dark:text-white font-medium' : ''}>At least 1 letter</span>
        </li>
        <li className="flex items-center gap-1.5">
          {hasNumber ? (
            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          ) : (
            <X className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
          )}
          <span className={hasNumber ? 'text-ink dark:text-white font-medium' : ''}>At least 1 number</span>
        </li>
      </ul>
    </div>
  );
}
