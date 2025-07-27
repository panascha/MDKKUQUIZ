import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../ui/Dialog';
import Button from '../../ui/Button';
import { LoaderIcon, X } from "lucide-react";
import Image from 'next/image';

interface AddSubjectModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  formData: {
    name: string;
    description: string;
    image: File | null;
    year: number;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  error: string | null;
  createMutation: {
    isPending: boolean;
  };
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  showModal,
  setShowModal,
  formData,
  handleInputChange,
  handleSubmit,
  resetForm,
  error,
  createMutation,
}) => {
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

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
    if (!formData.image) {
      errors.image = 'Image is required.';
    }
    return errors;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateForm();
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) {
      handleSubmit(e);
    }
  };

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          resetForm();
          setFieldErrors({});
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Subject</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={onSubmit}
          className="w-full space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Name Input */}
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

          {/* Description Input */}
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
            {error && error.toLowerCase().includes('year') && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-semibold">
              Upload Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              onChange={handleInputChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {formData.image && (
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
            )}
            {fieldErrors.image && (
              <p className="text-red-500 text-sm">{fieldErrors.image}</p>
            )}
            {error && error.toLowerCase().includes('image') && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Submit Button */}
          <DialogFooter className="flex justify-between pt-4">
            <Button
              textButton="Submit"
              disabled={createMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {createMutation.isPending ? (
                <>
                  <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                "Save Subject"
              )}
            </Button>

            {/* Cancel Button */}
            <DialogClose asChild>
              <Button
                textButton="Cancel"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={resetForm}
              />
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectModal; 