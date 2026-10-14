import React from 'react';
import { motion } from 'framer-motion';

export default function Reveal({
  children,
  delay = 0,
  duration = 0.5,
  y = 24,
  className = '',
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
