import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../ui/Dialog';
import Button from '../../ui/Button';
import { LoaderIcon } from "lucide-react";
import Image from 'next/image';
import { X } from "lucide-react";
import { BACKEND_URL } from '../../../config/apiRoutes';

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
}) => {
  return (
    <Dialog
      open={editModal}
      onOpenChange={(open) => {
        setEditModal(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Edit Subject</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleEditSubmit}
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
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
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
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Year</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">Select a year</option>
              {[1, 2, 3, 4, 5, 6].map((year) => (
                <option key={year} value={year}>
                  Year {year}
                </option>
              ))}
            </select>
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
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
            {formData.image instanceof File ? (
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
          </div>

          {/* Buttons */}
          <DialogFooter className="flex justify-between pt-4">
            <Button
              textButton="Update"
              disabled={editMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
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

            <DialogClose asChild>
              <Button
                textButton="Cancel"
                className="bg-red-500 hover:bg-red-800"
                onClick={resetForm}
              />
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubjectModal; 