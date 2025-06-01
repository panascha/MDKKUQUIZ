import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { LoaderIcon } from "lucide-react";
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
  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        setShowModal(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden">
        <DialogHeader>
          <DialogTitle>Subject</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
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
            {error && error.includes('name') && (
              <p className="text-red-500 text-sm">Name is required.</p>
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
            {error && error.includes('description') && (
              <p className="text-red-500 text-sm">Description is required.</p>
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
            {error && error.includes('year') && (
              <p className="text-red-500 text-sm">Year is required.</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label htmlFor="image" className="mb-1 block text-sm font-semibold">
              Upload Image (Optional)
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
              <p className="text-sm text-gray-600">Selected: {formData.image.name}</p>
            )}
            {error && error.includes('image') && (
              <p className="text-red-500 text-sm">Please upload a valid image.</p>
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