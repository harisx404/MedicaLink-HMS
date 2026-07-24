import React, { useEffect, useRef, useState } from 'react';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';

// Note: Integrating WebWorkers for cornerstoneWADOImageLoader is required for real DICOM parsing
// but for the sake of this UI, we will initialize core and tools to show the structural setup.
// Real WASM initialization requires copying codecs to public folder.

interface DicomViewerProps {
  imageIds?: string[];
  fallbackImageUrl?: string;
  className?: string;
}

export const DicomViewer: React.FC<DicomViewerProps> = ({ 
  imageIds = [], 
  fallbackImageUrl = 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?q=80&w=800&auto=format&fit=crop', // Stock X-Ray for demo
  className = ''
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [activeTool, setActiveTool] = useState('Pan');

  useEffect(() => {
    const initCornerstone = async () => {
      try {
        await cornerstone.init();
        await cornerstoneTools.init();
        setIsReady(true);
      } catch (error) {
        console.warn('Cornerstone init skipped or failed:', error);
        // Fallback gracefully without throwing
        setIsReady(true); 
      }
    };
    initCornerstone();
  }, []);

  useEffect(() => {
    if (!isReady || !elementRef.current) return;

    // In a full implementation, we would create a RenderingEngine, a Viewport,
    // and load the imageIds here.
    // For portfolio demo, if no valid DICOM IDs are provided, we show a mock UI over the fallback.
    
    const currentElem = elementRef.current;
    return () => {
      if (currentElem) {
        // cornerstone.disable(currentElem);
      }
    };
  }, [isReady, imageIds]);

  return (
    <div className={`flex flex-col h-full bg-slate-900 rounded-lg overflow-hidden border border-slate-700 ${className}`}>
      {/* Viewer Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-slate-800 border-b border-slate-700 text-white">
        {['Pan', 'Zoom', 'W/L', 'Measure', 'Reset'].map((tool) => (
          <button
            key={tool}
            onClick={() => setActiveTool(tool)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeTool === tool ? 'bg-blue-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
            }`}
          >
            {tool}
          </button>
        ))}
        <div className="ml-auto text-xs text-slate-400">
          {imageIds.length > 0 ? `${imageIds.length} Images` : 'Demo Mode'}
        </div>
      </div>

      {/* Viewport Canvas */}
      <div 
        className="flex-1 relative bg-black flex items-center justify-center overflow-hidden"
        onContextMenu={(e) => e.preventDefault()}
      >
        <div 
          ref={elementRef}
          className="w-full h-full absolute inset-0"
        />
        
        {/* Mock overlay if no real DICOMs */}
        {imageIds.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
            <img 
              src={fallbackImageUrl} 
              alt="Medical Scan Placeholder" 
              className="max-h-full max-w-full object-contain grayscale"
              style={{ filter: activeTool === 'W/L' ? 'contrast(1.5) brightness(0.8)' : 'none' }}
            />
            {/* DICOM Overlay Mock */}
            <div className="absolute top-4 left-4 text-emerald-400 font-mono text-[10px] sm:text-xs">
              <div>Patient: DOE^JOHN</div>
              <div>ID: MRN-192837</div>
              <div>DOB: 1980-01-01</div>
            </div>
            <div className="absolute bottom-4 right-4 text-emerald-400 font-mono text-[10px] sm:text-xs text-right">
              <div>WL: 40 WW: 400</div>
              <div>Zoom: 1.0x</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
