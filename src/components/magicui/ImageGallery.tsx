import React, { useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { 
  XMarkIcon, 
  MagnifyingGlassPlusIcon, 
  MagnifyingGlassMinusIcon,
  ArrowsPointingOutIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import { BACKEND_URL } from '../../config/apiRoutes';
import { useImageGallery } from '../../hooks/useImageGallery';

interface ImageGalleryProps {
  images: string[];
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className }) => {
  const {
    // State
    currentIndex,
    isModalOpen,
    zoomLevel,
    position,
    isLoading,
    imageError,
    fullscreenMode,
    isDragging,
    touchDistance,
    touchStartPos,
    isTouchDragging,
    dragStart,
    minZoom,
    maxZoom,
    
    // Computed
    currentImage,
    hasMultipleImages,
    
    // Actions
    goToPrevious,
    goToNext,
    openModal,
    closeModal,
    zoomIn,
    zoomOut,
    resetZoom,
    resetImageState,
    setImageIndex,
    toggleFullscreen,
    
    // Setters
    setIsLoading,
    setImageError,
    setZoomLevel,
    setPosition,
    setIsDragging,
    setTouchDistance,
    setTouchStartPos,
    setIsTouchDragging,
  } = useImageGallery({ images });

  const imageRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch handling for mobile pan and zoom
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1 && zoomLevel > 1) {
      // Single touch for panning when zoomed
      const touch = e.touches[0];
      setIsTouchDragging(true);
      setTouchStartPos({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y,
      });
    } else if (e.touches.length === 2) {
      // Two finger gesture for panning (changed from zooming)
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      // Calculate center point of the two touches for panning
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setIsTouchDragging(true);
      setTouchStartPos({
        x: centerX - position.x,
        y: centerY - position.y,
      });
    }
  }, [zoomLevel, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Remove preventDefault to avoid passive event listener warning
    // The native event listeners will handle preventDefault
    
    if (e.touches.length === 1 && isTouchDragging && zoomLevel > 1) {
      // Handle single touch panning (only when zoomed in)
      const touch = e.touches[0];
      const newX = touch.clientX - touchStartPos.x;
      const newY = touch.clientY - touchStartPos.y;

      // Calculate boundaries similar to mouse drag
      if (imageRef.current && modalRef.current) {
        const imageWidth = imageRef.current.offsetWidth * zoomLevel;
        const imageHeight = imageRef.current.offsetHeight * zoomLevel;
        const modalWidth = modalRef.current.offsetWidth;
        const modalHeight = modalRef.current.offsetHeight;

        const maxX = Math.max(0, imageWidth - modalWidth) / 2;
        const maxY = Math.max(0, imageHeight - modalHeight) / 2;
        const minX = -maxX;
        const minY = -maxY;

        setPosition({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        });
      }
    } else if (e.touches.length === 2 && isTouchDragging) {
      // Handle two finger panning (works at any zoom level)
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      // Calculate center point of the two touches
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      
      const newX = centerX - touchStartPos.x;
      const newY = centerY - touchStartPos.y;

      // Calculate boundaries for panning
      if (imageRef.current && modalRef.current) {
        const imageWidth = imageRef.current.offsetWidth * zoomLevel;
        const imageHeight = imageRef.current.offsetHeight * zoomLevel;
        const modalWidth = modalRef.current.offsetWidth;
        const modalHeight = modalRef.current.offsetHeight;

        const maxX = Math.max(0, imageWidth - modalWidth) / 2;
        const maxY = Math.max(0, imageHeight - modalHeight) / 2;
        const minX = -maxX;
        const minY = -maxY;

        setPosition({
          x: Math.max(minX, Math.min(maxX, newX)),
          y: Math.max(minY, Math.min(maxY, newY)),
        });
      }
    }
  }, [zoomLevel, isTouchDragging, touchStartPos]);

  const handleTouchEnd = useCallback(() => {
    setIsTouchDragging(false);
    setTouchDistance(0);
    // Reset touch start position
    setTouchStartPos({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault(); // Always prevent default to enable panning
    
    // Use scroll for panning instead of zooming
    const panSpeed = 0.5; // Adjust this value to control panning sensitivity
    const deltaX = e.deltaX * panSpeed;
    const deltaY = e.deltaY * panSpeed;
    
    // Calculate new position
    const newX = position.x - deltaX;
    const newY = position.y - deltaY;
    
    // Calculate boundaries for panning
    if (imageRef.current && modalRef.current) {
      const imageWidth = imageRef.current.offsetWidth * zoomLevel;
      const imageHeight = imageRef.current.offsetHeight * zoomLevel;
      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;

      const maxX = Math.max(0, (imageWidth - modalWidth) / 2);
      const maxY = Math.max(0, (imageHeight - modalHeight) / 2);
      const minX = -maxX;
      const minY = -maxY;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    }
  }, [position, zoomLevel]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel > 1 && imageRef.current && modalRef.current) {
      setIsDragging(true);
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      };
      if (modalRef.current) {
        modalRef.current.style.cursor = 'grabbing';
      }
      // Prevent text selection during drag
      e.preventDefault();
    }
  }, [zoomLevel, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !imageRef.current || !modalRef.current || zoomLevel <= 1) {
      return;
    }

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    const imageWidth = imageRef.current.offsetWidth * zoomLevel;
    const imageHeight = imageRef.current.offsetHeight * zoomLevel;
    const modalWidth = modalRef.current.offsetWidth;
    const modalHeight = modalRef.current.offsetHeight;

    const maxX = Math.max(0, (imageWidth - modalWidth) / 2);
    const maxY = Math.max(0, (imageHeight - modalHeight) / 2);
    const minX = -maxX;
    const minY = -maxY;

    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY)),
    });
  }, [isDragging, zoomLevel]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    if (modalRef.current) {
      modalRef.current.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
    }
  }, [zoomLevel]);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    if (modalRef.current) {
      modalRef.current.style.cursor = zoomLevel > 1 ? 'grab' : 'zoom-in';
    }
  }, [zoomLevel]);

  // Function to calculate initial position to center the image
  const getInitialPosition = useCallback(() => {
    if (imageRef.current && modalRef.current) {
      const imageWidth = imageRef.current.offsetWidth;
      const imageHeight = imageRef.current.offsetHeight;
      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;

      return {
        x: (modalWidth - imageWidth) / 2,
        y: (modalHeight - imageHeight) / 2,
      };
    }
    return { x: 0, y: 0 };
  }, []);

  // Effect to center the image when modal opens or image changes
  useEffect(() => {
    if (isModalOpen) {
      setPosition(getInitialPosition());
      setZoomLevel(1); // Reset zoom when opening
    }
  }, [isModalOpen, currentIndex, getInitialPosition]);

  // Effect to adjust position when zoom level changes to keep center
  useEffect(() => {
    if (isModalOpen && imageRef.current && modalRef.current) {
      const prevZoom = zoomLevel - 0.2 > 0 ? zoomLevel - 0.2 : 1; // Approximate previous zoom
      const imageWidth = imageRef.current.offsetWidth * zoomLevel;
      const imageHeight = imageRef.current.offsetHeight * zoomLevel;
      const prevImageWidth = imageRef.current.offsetWidth * prevZoom;
      const prevImageHeight = imageRef.current.offsetHeight * prevZoom;
      const modalWidth = modalRef.current.offsetWidth;
      const modalHeight = modalRef.current.offsetHeight;

      setPosition((prevPosition) => ({
        x: prevPosition.x + (prevImageWidth - imageWidth) / 2,
        y: prevPosition.y + (prevImageHeight - imageHeight) / 2,
      }));

      // Ensure the image stays within bounds after zooming
      const maxX = Math.max(0, imageWidth - modalWidth) / 2;
      const maxY = Math.max(0, imageHeight - modalHeight) / 2;
      const minX = -maxX;
      const minY = -maxY;

      setPosition((currentPosition) => ({
        x: Math.max(minX, Math.min(maxX, currentPosition.x)),
        y: Math.max(minY, Math.min(maxY, currentPosition.y)),
      }));
    }
  }, [zoomLevel, isModalOpen]);

  const handleModalClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && event.target === modalRef.current) {
      closeModal();
    }
  }, [closeModal]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isModalOpen) return;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        goToPrevious();
        break;
      case 'ArrowRight':
        e.preventDefault();
        goToNext();
        break;
      case 'Escape':
        e.preventDefault();
        closeModal();
        break;
      case '+':
      case '=':
        e.preventDefault();
        zoomIn();
        break;
      case '-':
        e.preventDefault();
        zoomOut();
        break;
      case '0':
        e.preventDefault();
        resetZoom();
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  }, [isModalOpen, goToPrevious, goToNext, closeModal, zoomIn, zoomOut, resetZoom, toggleFullscreen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset'; // Cleanup on unmount
    };
  }, [handleKeyDown]);

  // Native touch event listeners with non-passive options to allow preventDefault
  useEffect(() => {
    if (!isModalOpen || !imageRef.current) return;

    const imageElement = imageRef.current;

    const handleNativeTouchMove = (e: TouchEvent) => {
      // Prevent default scroll behavior when interacting with the image
      if ((e.touches.length === 1 && isTouchDragging && zoomLevel > 1) || 
          (e.touches.length === 2 && isTouchDragging)) {
        e.preventDefault();
      }
    };

    const handleNativeTouchStart = (e: TouchEvent) => {
      // Prevent default behavior for touch interactions with the image
      if (e.touches.length >= 1) {
        e.preventDefault();
      }
    };

    // Add non-passive touch listeners
    imageElement.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
    imageElement.addEventListener('touchstart', handleNativeTouchStart, { passive: false });

    return () => {
      imageElement.removeEventListener('touchmove', handleNativeTouchMove);
      imageElement.removeEventListener('touchstart', handleNativeTouchStart);
    };
  }, [isModalOpen, isTouchDragging, zoomLevel]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const ErrorDisplay = () => (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-500">
      <PhotoIcon className="h-12 w-12 mb-2" />
      <span className="text-sm">Failed to load image</span>
    </div>
  );

  const LoadingDisplay = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className={cn("relative w-[280px] md:w-[250px]", className)} ref={containerRef}>
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 z-10 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        className="relative aspect-square cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
        onClick={openModal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openModal()}
        aria-label={`Open image gallery - Image ${currentIndex + 1} of ${images.length}`}
      >
        {isLoading && <LoadingDisplay />}
        {imageError ? (
          <ErrorDisplay />
        ) : (
          <>
            <Image
              src={`${BACKEND_URL}${currentImage}`}
              alt={`Image ${currentIndex + 1} of ${images.length}`}
              className={cn(
                "object-cover w-full h-full transition-all duration-300 group-hover:scale-105",
                isLoading && "opacity-0"
              )}
              onLoad={handleImageLoad}
              onError={handleImageError}
              width={280}
              height={280}
              priority={currentIndex === 0}
            />
            {/* Preview overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                <MagnifyingGlassPlusIcon className="h-6 w-6 text-gray-700" />
              </div>
            </div>
          </>
        )}
        
        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            {currentIndex + 1}/{images.length}
          </div>
        )}
        
        {/* Watermark */}
        <div className="absolute bottom-2 right-2 bg-white/70 text-xs font-medium text-gray-700 px-2 py-1 rounded opacity-80 select-none">
          MSEB
        </div>
      </div>

      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white rounded-full p-2 z-10 hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {isModalOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/90 z-50 flex items-center justify-center",
            fullscreenMode ? "bg-black" : ""
          )}
          ref={modalRef}
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery modal"
        >
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center text-white">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  <span>Loading image...</span>
                </div>
              </div>
            )}
            
            {imageError ? (
              <div className="flex flex-col items-center text-white">
                <PhotoIcon className="h-24 w-24 mb-4" />
                <span className="text-xl">Failed to load image</span>
                <button 
                  onClick={() => setImageIndex(currentIndex)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <Image
                ref={imageRef}
                src={`${BACKEND_URL}${currentImage}`}
                alt={`Large Image ${currentIndex + 1} of ${images.length}`}
                className={cn(
                  "transition-transform duration-300 select-none",
                  zoomLevel > 1 ? (isDragging || isTouchDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in",
                  isLoading && "opacity-0"
                )}
                style={{ 
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                  maxWidth: '90vw',
                  maxHeight: '90vh',
                  objectFit: 'contain'
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={(e) => {
                  e.stopPropagation();
                  if (zoomLevel === 1) zoomIn();
                }}
                width={800}
                height={800}
                quality={95}
                priority
              />
            )}
            
            {/* Watermark for modal */}
            <div className="absolute bottom-4 right-4 bg-white/80 text-sm font-medium text-gray-700 px-3 py-2 rounded-lg opacity-90 select-none shadow-lg">
              MSEB
            </div>
            
            {/* Control buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <div className="flex bg-black/50 rounded-lg overflow-hidden">
                <button
                  onClick={zoomOut}
                  disabled={zoomLevel <= minZoom}
                  className="p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom out (-)"
                >
                  <MagnifyingGlassMinusIcon className="h-5 w-5" />
                </button>
                <div className="px-3 py-2 text-white text-sm bg-black/30 flex items-center min-w-[60px] justify-center">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <button
                  onClick={zoomIn}
                  disabled={zoomLevel >= maxZoom}
                  className="p-2 text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Zoom in (+)"
                >
                  <MagnifyingGlassPlusIcon className="h-5 w-5" />
                </button>
              </div>
              
              <button
                onClick={resetZoom}
                className="bg-black/50 text-white rounded-lg p-2 hover:bg-black/70"
                title="Reset zoom (0)"
              >
                <span className="text-sm font-medium">1:1</span>
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="bg-black/50 text-white rounded-lg p-2 hover:bg-black/70"
                title="Toggle fullscreen (F)"
              >
                <ArrowsPointingOutIcon className="h-5 w-5" />
              </button>
              
              <button
                onClick={closeModal}
                className="bg-black/50 text-white rounded-lg p-2 hover:bg-black/70"
                title="Close (Esc)"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            
            {/* Navigation arrows for modal */}
            {images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  title="Previous image (←)"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  title="Next image (→)"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Image indicators */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/50 rounded-full px-4 py-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setImageIndex(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-200",
                      index === currentIndex 
                        ? "bg-white scale-125" 
                        : "bg-white/50 hover:bg-white/80"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
            
            {/* Keyboard shortcuts help */}
            <div className="absolute bottom-4 left-4 bg-black/50 text-white text-xs rounded-lg p-3 hidden lg:block">
              <div className="space-y-1">
                <div>← → Navigate</div>
                <div>+ - Zoom</div>
                <div>0 Reset</div>
                <div>F Fullscreen</div>
                <div>Esc Close</div>
                {zoomLevel > 1 && <div className="text-yellow-400">🖱️ Drag to pan</div>}
              </div>
            </div>
            
            {/* Mobile touch instructions */}
            {zoomLevel > 1 && (
              <div className="absolute top-4 left-4 bg-black/50 text-white text-xs rounded-lg p-2 lg:hidden">
                <div>👆 Drag to pan • 🤏 Pinch to zoom</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;