import React from 'react';
import { motion } from 'framer-motion';
import { Fingerprint } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface UHIDDisplayProps {
  uhid: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  copyable?: boolean;
}

export const UHIDDisplay: React.FC<UHIDDisplayProps> = ({ uhid, className, size = 'md', copyable = false }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!copyable) return;
    navigator.clipboard.writeText(uhid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5 font-semibold',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <motion.div
      whileHover={copyable ? { scale: 1.02 } : {}}
      whileTap={copyable ? { scale: 0.98 } : {}}
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200 font-mono tracking-tight',
        copyable && 'cursor-pointer hover:bg-blue-100 transition-colors',
        sizeClasses[size],
        className
      )}
      title={copyable ? (copied ? 'Copied!' : 'Click to copy') : undefined}
    >
      <Fingerprint size={iconSizes[size]} className="opacity-70" />
      <span>{uhid}</span>
      {copyable && copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded shadow-sm">
          Copied
        </span>
      )}
    </motion.div>
  );
};
