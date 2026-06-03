import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function PageWrapper({ children, title, className = '' }: PageWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 ${className}`}
    >
      {title && (
        <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">
          {title}
        </h1>
      )}
      {children}
    </motion.div>
  );
}
