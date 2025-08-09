import { useEffect, useCallback } from 'react';
import { useTabChangeDetection } from './useTabChangeDetection';
import { useAdvancedSessionStorage } from './useAdvancedSessionStorage';

interface UseFormSessionStorageProps<T> {
  formData: T;
  storageKey: string;
  saveOnChange?: boolean;
  saveOnTabChange?: boolean;
  saveOnUnload?: boolean;
  debounceMs?: number;
  onDataLoaded?: (data: T) => void;
  validateData?: (data: any) => data is T;
}

export const useFormSessionStorage = <T>({
  formData,
  storageKey,
  saveOnChange = true,
  saveOnTabChange = true,
  saveOnUnload = true,
  debounceMs = 500,
  onDataLoaded,
  validateData
}: UseFormSessionStorageProps<T>) => {
  const { 
    debouncedSave, 
    saveImmediately, 
    loadFromSessionStorage,
    removeFromSessionStorage,
    clearTimeouts 
  } = useAdvancedSessionStorage({ 
    key: storageKey,
    debounceMs 
  });

  // Load data on mount
  useEffect(() => {
    const savedData = loadFromSessionStorage();
    if (savedData) {
      try {
        if (validateData && !validateData(savedData)) {
          console.warn('Invalid saved data format, skipping load');
          return;
        }
        onDataLoaded?.(savedData);
      } catch (error) {
        console.warn('Failed to load form data:', error);
      }
    }
  }, [loadFromSessionStorage, onDataLoaded, validateData]);

  // Save on form data changes
  useEffect(() => {
    if (saveOnChange && formData) {
      debouncedSave(formData);
    }
  }, [formData, saveOnChange, debouncedSave]);

  // Tab change detection
  const { saveNow } = useTabChangeDetection({
    onTabChange: () => {
      if (saveOnTabChange && formData) {
        console.log(`Tab change detected - saving form data for ${storageKey}`);
        saveImmediately(formData);
      }
    },
    onBeforeUnload: () => {
      if (saveOnUnload && formData) {
        console.log(`Page unloading - saving form data for ${storageKey}`);
        saveImmediately(formData);
      }
    },
    onVisibilityChange: (isVisible) => {
      if (!isVisible && saveOnTabChange && formData) {
        console.log(`Tab hidden - saving form data for ${storageKey}`);
        saveImmediately(formData);
      }
    }
  });

  // Manual save function
  const saveFormData = useCallback(() => {
    if (formData) {
      saveImmediately(formData);
    }
  }, [formData, saveImmediately]);

  // Clear saved data
  const clearFormData = useCallback(() => {
    removeFromSessionStorage();
  }, [removeFromSessionStorage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      if (saveOnUnload && formData) {
        saveImmediately(formData);
      }
    };
  }, [clearTimeouts, saveImmediately, formData, saveOnUnload]);

  return {
    saveFormData,
    clearFormData,
    saveNow,
    loadFromSessionStorage
  };
};

// Example usage for different form types
export const useQuizFormStorage = (quizData: any, subjectID: string) => {
  return useFormSessionStorage({
    formData: quizData,
    storageKey: `quiz_form_${subjectID}`,
    saveOnChange: true,
    saveOnTabChange: true,
    saveOnUnload: true,
    debounceMs: 500,
    validateData: (data): data is any => {
      return data && typeof data === 'object' && Array.isArray(data);
    }
  });
};

export const useRegistrationFormStorage = (formData: any) => {
  return useFormSessionStorage({
    formData,
    storageKey: 'registration_form',
    saveOnChange: true,
    saveOnTabChange: true,
    saveOnUnload: true,
    debounceMs: 1000,
    validateData: (data): data is any => {
      return data && typeof data === 'object' && 'email' in data;
    }
  });
};

export const useProfileFormStorage = (formData: any, userId: string) => {
  return useFormSessionStorage({
    formData,
    storageKey: `profile_form_${userId}`,
    saveOnChange: true,
    saveOnTabChange: true,
    saveOnUnload: true,
    debounceMs: 1000
  });
};
