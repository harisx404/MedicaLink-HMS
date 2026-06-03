import { Search, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  isLoading?: boolean;
  debounceMs?: number;
  className?: string;
}

export function SearchInput({ 
  placeholder = 'Search...', 
  onSearch, 
  isLoading = false,
  debounceMs = 300,
  className 
}: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  return (
    <div className={cn("relative group", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-10 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all placeholder:text-muted-foreground/70"
      />
      {isLoading && (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
      )}
    </div>
  );
}
