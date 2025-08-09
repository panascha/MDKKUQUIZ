import { useState, useCallback, useRef } from 'react';

interface UseImageGalleryProps {
  images: string[];
  initialIndex?: number;
}

export const useImageGallery = ({ images, initialIndex = 0 }: UseImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [fullscreenMode, setFullscreenMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [touchDistance, setTouchDistance] = useState(0);
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 });
  const [isTouchDragging, setIsTouchDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const minZoom = 0.5;
  const maxZoom = 2;

  const resetImageState = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setZoomLevel(1);
    setIsLoading(true);
    setImageError(false);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    resetImageState();
  }, [images.length, resetImageState]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    resetImageState();
  }, [images.length, resetImageState]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    resetImageState();
    document.body.style.overflow = 'hidden';
  }, [resetImageState]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFullscreenMode(false);
    document.body.style.overflow = 'unset';
  }, []);
  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.2, maxZoom));
  }, [maxZoom]);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.2, minZoom));
  }, [minZoom]);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const setImageIndex = useCallback((index: number) => {
    if (index >= 0 && index < images.length) {
      setCurrentIndex(index);
      resetImageState();
    }
  }, [images.length, resetImageState]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreenMode(true);
    } else {
      document.exitFullscreen?.();
      setFullscreenMode(false);
    }
  }, []);

  return {
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
    currentImage: images[currentIndex],
    hasMultipleImages: images.length > 1,
    
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
  };
};
