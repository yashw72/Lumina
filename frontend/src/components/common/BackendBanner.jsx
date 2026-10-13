import React from 'react';
import { AlertCircle, RefreshCw, Radio } from 'lucide-react';
import Button from './Button.jsx';

export default function BackendBanner({ online, checking, retry, baseUrl }) {
  if (online) return null;

  return (
    <div className="w-full bg-rose-600 text-white px-4 py-2.5 transition-all duration-300 animate-in slide-in-from-top-full shadow-md z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <AlertCircle className="w-4 h-4 shrink-0 text-white animate-pulse" />
          <span>
            <strong className="font-semibold">Backend is not reachable</strong> at{' '}
            <code className="bg-rose-700 px-1.5 py-0.5 rounded font-mono text-[11px]">
              {baseUrl}
            </code>
            . Start it with <code className="bg-rose-700 px-1 py-0.5 rounded">uvicorn</code>, or
            check <code className="bg-rose-700 px-1 py-0.5 rounded">CORS_ORIGINS</code> if it is
            already running.
          </span>
        </div>

        <button
          type="button"
          onClick={retry}
          disabled={checking}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium text-xs transition-colors shrink-0 focus:outline-none"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Checking...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  );
}
