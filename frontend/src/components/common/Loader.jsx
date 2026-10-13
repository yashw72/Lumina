import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loader({
  size = 'md',
  message = 'Loading...',
  center = true,
  className = '',
}) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className={`${sizeMap[size] || sizeMap.md} animate-spin text-indigo-600 dark:text-indigo-400`}
      />
      {message && (
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (center) {
    return <div className="py-12 flex justify-center items-center w-full">{content}</div>;
  }

  return content;
}
