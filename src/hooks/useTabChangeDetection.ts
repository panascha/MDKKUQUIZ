import { useEffect, useRef } from 'react';

interface UseTabChangeDetectionProps {
  onTabChange?: () => void;
  onBeforeUnload?: () => void;
  onVisibilityChange?: (isVisible: boolean) => void;
}

export const useTabChangeDetection = ({
  onTabChange,
  onBeforeUnload,
  onVisibilityChange
}: UseTabChangeDetectionProps = {}) => {
  const lastSaveTime = useRef<number>(0);
  const saveThrottleTime = 1000; // Minimum time between saves (1 second)

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      
      // Call the visibility change callback
      onVisibilityChange?.(isVisible);
      
      // Save data when tab becomes hidden (user switched tabs)
      if (!isVisible && onTabChange) {
        const now = Date.now();
        if (now - lastSaveTime.current > saveThrottleTime) {
          onTabChange();
          lastSaveTime.current = now;
        }
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Save data before user leaves the page
      if (onBeforeUnload) {
        onBeforeUnload();
      }
      
      // Optional: Show confirmation dialog
      // event.preventDefault();
      // event.returnValue = '';
    };

    const handlePageHide = () => {
      // Save data when page is being hidden (more reliable than beforeunload)
      if (onTabChange) {
        onTabChange();
      }
    };

    const handleFocus = () => {
      // User came back to the tab
      onVisibilityChange?.(true);
    };

    const handleBlur = () => {
      // User left the tab/window
      if (onTabChange) {
        const now = Date.now();
        if (now - lastSaveTime.current > saveThrottleTime) {
          onTabChange();
          lastSaveTime.current = now;
        }
      }
      onVisibilityChange?.(false);
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      // Cleanup event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onTabChange, onBeforeUnload, onVisibilityChange]);

  return {
    saveNow: () => {
      if (onTabChange) {
        onTabChange();
        lastSaveTime.current = Date.now();
      }
    }
  };
};
