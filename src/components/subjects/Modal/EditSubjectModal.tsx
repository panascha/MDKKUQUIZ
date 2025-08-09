import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../ui/Dialog';
import Button from '../../ui/Button';
import { LoaderIcon } from "lucide-react";
import Image from 'next/image';
import { X } from "lucide-react";
import { BACKEND_URL } from '../../../config/apiRoutes';
import { useFormSessionStorage } from '../../../hooks/useFormSessionStorage';

interface EditSubjectModalProps {
  editModal: boolean;
  setEditModal: (show: boolean) => void;
  formData: {
    name: string;
    description: string;
    image: File | null;
    year: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleEditSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  error: string | null;
  editMutation: {
    isPending: boolean;
  };
  existingImg: string | null;
  subjectId?: string | number; // Add unique identifier for session storage
  onLoadSavedData?: (savedData: any) => void; // Add callback for loading saved data
}

const EditSubjectModal: React.FC<EditSubjectModalProps> = ({
  editModal,
  setEditModal,
  formData,
  handleInputChange,
  handleEditSubmit,
  resetForm,
  error,
  editMutation,
  existingImg,
  subjectId,
  onLoadSavedData,
}) => {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Prepare serializable form data (excluding File object)
  const serializableFormData = {
    name: formData.name,
    description: formData.description,
    year: formData.year,
    imageName: formData.image?.name || null,
    imageSize: formData.image?.size || null,
    imageType: formData.image?.type || null,
    hasExistingImage: !!existingImg
  };

  // Dynamic session storage with tab change detection
  const { saveFormData, clearFormData } = useFormSessionStorage({
    formData: serializableFormData,
    storageKey: `edit_subject_form_${subjectId || 'unknown'}`, // Unique key per subject
    saveOnChange: true,
    saveOnTabChange: true,
    saveOnUnload: true,
    debounceMs: 1000, // Save 1 second after user stops typing
    onDataLoaded: (savedData) => {
      if (!isDataLoaded && onLoadSavedData && savedData) {
        // Only restore text data, not file data (files can't be serialized)
        const restoreData = {
          name: savedData.name || '',
          description: savedData.description || '', 
          year: savedData.year || '',
          // Don't restore image file - user needs to re-select
          image: null
        };
        onLoadSavedData(restoreData);
        setIsDataLoaded(true);
        
        // Show notification if data was restored
        if (savedData.name || savedData.description || savedData.year) {
          console.log('Previous edit form data restored (image needs to be re-selected if changed)');
        }
      }
    },
    validateData: (data): data is typeof serializableFormData => {
      return data && typeof data === 'object' && 
             'name' in data && 'description' in data && 'year' in data;
    }
  });

  // Clear saved data when modal is closed successfully
  useEffect(() => {
    if (!editModal && !editMutation.isPending) {
      // Clear saved data when modal closes (form was either submitted or cancelled)
      clearFormData();
      setIsDataLoaded(false);
    }
  }, [editModal, editMutation.isPending, clearFormData]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (formData.name.length > 100) {
      errors.name = 'Name cannot be more than 100 characters.';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    } else if (formData.description.length > 1000) {
      errors.description = 'Description cannot be more than 1000 characters.';
    }
    if (!formData.year || isNaN(Number(formData.year))) {
      errors.year = 'Year is required.';
    } else if (Number(formData.year) < 1 || Number(formData.year) > 6) {
      errors.year = 'Year must be between 1 and 6.';
    }
    return errors;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) {
      // Clear saved data before submitting (form is complete)
      clearFormData();
      handleEditSubmit(e);
    }
  };

  const handleModalClose = (open: boolean) => {
    setEditModal(open);
    if (!open) {
      // Reset form and errors when closing
      resetForm();
      setFieldErrors({});
      // Don't clear saved data here - let the useEffect handle it
      // based on whether submission was successful
    }
  };
  return (
    <Dialog
      open={editModal}
      onOpenChange={handleModalClose}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Subject
            {/* Data restoration indicator */}
            {isDataLoaded && (formData.name || formData.description || formData.year) && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                📄 Previous changes restored
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          className="w-full space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Name */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Biology"
            />
            {fieldErrors.name && (
              <p className="text-red-500 text-sm">{fieldErrors.name}</p>
            )}
            {error && error.toLowerCase().includes('name') && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Everything about Biology"
            />
            {fieldErrors.description && (
              <p className="text-red-500 text-sm">{fieldErrors.description}</p>
            )}
            {error && error.toLowerCase().includes('description') && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="" disabled>Select a year</option>
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
            {fieldErrors.year && (
              <p className="text-red-500 text-sm">{fieldErrors.year}</p>
            )}
            {error && error.includes('year') && (
              <p className="text-red-500 text-sm">Year is required.</p>
            )}
          </div>
          
          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-semibold">
              Upload New Image (optional)
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {formData.image ? (
              <div className="mt-4 relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={URL.createObjectURL(formData.image)}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'image', value: null } } as any)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="mt-1 text-xs text-gray-600 truncate">{formData.image.name}</p>
              </div>
            ) : existingImg && (
              <div className="mt-4 relative group">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={existingImg.startsWith("http") ? existingImg : `${BACKEND_URL}${existingImg}`}
                    alt="Current Image"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-600">Current image</p>
              </div>
            )}
            {error && error.toLowerCase().includes('image') && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Buttons */}
          <DialogFooter className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                textButton="Update"
                disabled={editMutation.isPending}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold flex items-center justify-center gap-2"
              >
                {editMutation.isPending ? (
                  <>
                    <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                    Updating...
                  </>
                ) : (
                  "Update Subject"
                )}
              </Button>
            </div>
            <div className="flex gap-2">
              {/* Cancel Button */}
              <DialogClose asChild>
                <Button
                  textButton="Cancel"
                  className="bg-red-500 hover:bg-red-800"
                  onClick={resetForm}
                />
              </DialogClose>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectModal; 