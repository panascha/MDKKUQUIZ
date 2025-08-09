import { useCallback, useRef } from 'react';

interface UseAdvancedSessionStorageProps {
  key: string;
  debounceMs?: number;
}

export const useAdvancedSessionStorage = ({ 
  key, 
  debounceMs = 500 
}: UseAdvancedSessionStorageProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  const saveToSessionStorage = useCallback((data: any) => {
    try {
      const dataString = JSON.stringify(data);
      
      // Only save if data has actually changed
      if (dataString !== lastSaveRef.current) {
        sessionStorage.setItem(key, dataString);
        lastSaveRef.current = dataString;
        console.log(`Saved to session storage: ${key}`);
      }
    } catch (error) {
      console.warn(`Failed to save to session storage (${key}):`, error);
    }
  }, [key]);

  const debouncedSave = useCallback((data: any) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveToSessionStorage(data);
    }, debounceMs);
  }, [saveToSessionStorage, debounceMs]);

  const saveImmediately = useCallback((data: any) => {
    // Clear any pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    saveToSessionStorage(data);
  }, [saveToSessionStorage]);

  const loadFromSessionStorage = useCallback(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn(`Failed to load from session storage (${key}):`, error);
    }
    return null;
  }, [key]);

  const removeFromSessionStorage = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      lastSaveRef.current = '';
      console.log(`Removed from session storage: ${key}`);
    } catch (error) {
      console.warn(`Failed to remove from session storage (${key}):`, error);
    }
  }, [key]);

  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    debouncedSave,
    saveImmediately,
    loadFromSessionStorage,
    removeFromSessionStorage,
    clearTimeouts
  };
};
