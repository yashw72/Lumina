import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const PasswordInput = forwardRef(function PasswordInput(
  { id, value, onChange, placeholder = 'Enter your password', disabled, error, className = '', ...props },
  ref
) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <input
        ref={ref}
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`w-full px-4 py-2.5 pr-11 text-sm rounded-xl transition-all duration-200 outline-none
          bg-white/70 dark:bg-white/5 border text-ink dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
          ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-200 dark:border-white/10 focus:border-lilac-500 dark:focus:border-lilac-400 focus:ring-2 focus:ring-lilac-500/20'
          }
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      />
      <button
        type="button"
        tabIndex={0}
        onClick={() => setShow(!show)}
        disabled={disabled}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 focus:outline-none rounded-lg focus:ring-2 focus:ring-lilac-500/30 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
});

export default PasswordInput;
