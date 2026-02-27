import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { cn } from '../../lib/utils';
import { BACKEND_URL } from '../../config/apiRoutes';
import {
  XMarkIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PhotoIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Reset state when images change
  useEffect(() => {
    setCurrentIndex(0);
    setHasError(false);
    setIsLoading(true);
  }, [images]);

  const handleOpen = (index: number) => {
    setCurrentIndex(index);
    setIsOpen(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  };

  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = 'unset';
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setIsLoading(true);
    setHasError(false);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsLoading(true);
    setHasError(false);
  };

  // --- Thumbnail Component ---
  return (
    <>
      <div className={cn("relative group select-none w-full max-w-[300px]", className)}>
        {/* Main Thumbnail Card */}
        <div 
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 shadow-md border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          onClick={() => handleOpen(currentIndex)}
        >
          {hasError ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <PhotoIcon className="h-12 w-12 mb-2" />
              <span className="text-xs">Image not found</span>
            </div>
          ) : (
            <Image
              unoptimized
              src={`${BACKEND_URL}${images[currentIndex]}`}
              alt={`Gallery Image ${currentIndex + 1}`}
              fill
              className={cn(
                "object-cover transition-all duration-500",
                isLoading ? "scale-110 blur-lg" : "scale-100 blur-0"
              )}
              onLoad={() => setIsLoading(false)}
              onError={() => { setIsLoading(false); setHasError(true); }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg">
              <ArrowsPointingOutIcon className="h-6 w-6 text-gray-800" />
            </div>
          </div>

          {/* Badges */}
          {images.length > 1 && (
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-800 px-2 py-0.5 rounded shadow-sm">
            MSEB
          </div>
        </div>

        {/* External Navigation Arrows (if needed for gallery feel) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute -left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-0"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-0"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <LightboxModal
          images={images}
          initialIndex={currentIndex}
          onClose={handleClose}
        />
      )}
    </>
  );
};

// --- Sub-component: Lightbox Modal (Separated for cleaner logic) ---
interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

const LightboxModal: React.FC<LightboxProps> = ({ images, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const startPos = useRef({ x: 0, y: 0 });

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-') handleZoomOut();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index]);

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const nextImage = () => {
    resetZoom();
    setImgLoading(true);
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    resetZoom();
    setImgLoading(true);
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const handleZoomOut = () => {
    setScale((s) => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  // Drag Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      startPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      setPosition({
        x: e.clientX - startPos.current.x,
        y: e.clientY - startPos.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  // Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    // e.stopPropagation();
    if (e.deltaY < 0) handleZoomIn();
    else handleZoomOut();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white/90 font-medium px-4 py-1 bg-white/10 rounded-full text-sm backdrop-blur-md">
          {index + 1} / {images.length}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div 
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onWheel={handleWheel}
      >
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 z-40 p-3 rounded-full bg-black/40 text-white hover:bg-white/20 transition-all focus:outline-none"
            >
              <ChevronLeftIcon className="h-8 w-8" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 z-40 p-3 rounded-full bg-black/40 text-white hover:bg-white/20 transition-all focus:outline-none"
            >
              <ChevronRightIcon className="h-8 w-8" />
            </button>
          </>
        )}

        {/* Loading Spinner */}
        {imgLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <div className="w-10 h-10 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        )}

        {/* Image Display */}
        <div 
          className="relative w-full h-full flex items-center justify-center p-4 transition-transform duration-100 ease-out"
          style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={`${BACKEND_URL}${images[index]}`}
            alt="Fullscreen view"
            className="max-h-full max-w-full object-contain select-none transition-transform duration-200"
            style={{ 
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            }}
            onLoad={() => setImgLoading(false)}
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col gap-4">
        {/* Thumbnails Strip */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 overflow-x-auto py-2 no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => { setIndex(idx); resetZoom(); setImgLoading(true); }}
                className={cn(
                  "relative block h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                  idx === index ? "border-blue-500 scale-110" : "border-transparent opacity-50 hover:opacity-100"
                )}
              >
                <Image 
                  src={`${BACKEND_URL}${img}`} 
                  alt="thumbnail" 
                  fill 
                  className="object-cover" 
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Zoom Controls */}
        <div className="flex justify-center items-center gap-4">
          <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full px-4 py-2 gap-4 border border-white/10">
            <button 
              onClick={handleZoomOut} 
              disabled={scale <= 1}
              className="text-white/80 hover:text-white disabled:opacity-30 transition-colors"
            >
              <MagnifyingGlassMinusIcon className="h-6 w-6" />
            </button>
            <span className="text-white text-sm font-mono min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={handleZoomIn} 
              disabled={scale >= 4}
              className="text-white/80 hover:text-white disabled:opacity-30 transition-colors"
            >
              <MagnifyingGlassPlusIcon className="h-6 w-6" />
            </button>
            <div className="w-px h-4 bg-white/20 mx-2"></div>
            <button 
              onClick={resetZoom} 
              className="text-white/80 hover:text-white text-xs font-medium uppercase tracking-wider"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGallery;