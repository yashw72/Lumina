import React from 'react';

export default function Skeleton({ className = '', rounded = 'rounded-2xl', ...props }) {
  return (
    <div
      className={`shimmer ${rounded} ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}
