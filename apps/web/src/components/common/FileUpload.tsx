import { useState, useCallback } from 'react';
import { UploadCloud, File, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onUpload: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileUpload({ onUpload, accept, maxSizeMB = 5, className }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        // Validate size (simplified for Phase 0)
        if (files[0].size > maxSizeMB * 1024 * 1024) {
          alert(`File is too large. Max size is ${maxSizeMB}MB`);
          return;
        }
        setSelectedFile(files[0]);
        onUpload(files[0]);
      }
    },
    [maxSizeMB, onUpload]
  );

  return (
    <div className={className}>
      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-border/60 hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-muted rounded-full">
              <UploadCloud className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                <span className="text-primary">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Max file size {maxSizeMB}MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 bg-muted/30 border border-border/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <File className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
