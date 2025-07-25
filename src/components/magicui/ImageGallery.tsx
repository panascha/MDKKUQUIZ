import React, { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { BACKEND_URL } from '../../config/apiRoutes';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);
  const modalRef = useRef<HTMLDivElement>(null); // Ref สำหรับ Modal Container
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const currentImage = images[currentIndex];

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
    setPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    setPosition({ x: 0, y: 0 });
    setZoomLevel(1);
  }, [images.length]);

  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

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

    const maxX = Math.max(0, imageWidth - modalWidth) / 2;
    const maxY = Math.max(0, imageHeight - modalHeight) / 2;
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
      modalRef.current.style.cursor = 'grab';
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
    if (modalRef.current) {
      modalRef.current.style.cursor = 'grab';
    }
  }, []);

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
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        closeModal();
        break;
    }
  }, [isModalOpen, goToPrevious, goToNext, closeModal]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative w-[280px] md:w-[250px]">
      {images.length > 1 && (
        <button
          onClick={goToPrevious}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/20 text-white rounded-full p-2 z-10 hover:bg-black/50 focus:outline-none"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      <div
        className="relative aspect-square md:aspect-square sm:aspect-square cursor-pointer overflow-hidden rounded-md shadow-md"
        onClick={openModal}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && openModal()}
        aria-label="Open image gallery"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
        <Image
          src={`${BACKEND_URL}${currentImage}`}
          alt={`Image ${currentIndex + 1} of ${images.length}`}
          className={cn(
            "object-cover w-full h-full transition-transform duration-300 hover:scale-105",
            isLoading && "opacity-0"
          )}
          onLoad={handleImageLoad}
          width={280}
          height={280}
          priority
        />
        {/* Watermark overlay for thumbnail */}
        <div className="absolute inset-0 flex items-end justify-end pointer-events-none">
          <span className="m-2 px-2 py-1 bg-white/60 text-xs font-bold text-gray-700 rounded opacity-70 select-none">
            MSEB
          </span>
        </div>
      </div>

      {images.length > 1 && (
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/20 text-white rounded-full p-2 z-10 hover:bg-black/50 focus:outline-none"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      {isModalOpen && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black/80 z-50 flex items-center justify-center cursor-pointer"
          ref={modalRef}
          onClick={handleModalClick}
          role="dialog"
          aria-modal="true"
          aria-label="Image gallery modal"
        >
          <div className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
            <Image
              ref={imageRef}
              src={`${BACKEND_URL}${currentImage}`}
              alt={`Large Image ${currentIndex + 1} of ${images.length}`}
              className={`transition-transform duration-300 cursor-grab`}
              style={{ transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)` }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              width={500}
              height={500}
              quality={100}
              priority
            />
            {/* Watermark overlay for modal */}
            <div className="absolute inset-0 flex items-end justify-end pointer-events-none">
              <span className="m-4 px-3 py-1 bg-white/70 text-base font-bold text-gray-700 rounded opacity-80 select-none shadow">
                คณะแพทยศาสตร์ มหาวิทยาลัยขอนแก่น
              </span>
            </div>
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={closeModal}
                className="bg-black/50 text-white rounded-full p-2 hover:bg-black/70 focus:outline-none"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;