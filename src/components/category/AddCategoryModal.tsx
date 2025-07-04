import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../components/ui/Dialog';
import Button from '../../components/ui/Button';
import { LoaderIcon } from "lucide-react";
import { Subject } from '../../types/api/Subject';
import { useUser } from '../../hooks/useUser';
import toast from 'react-hot-toast';
import { CreateCategoryData, useCreateCategory } from '../../hooks/category/useCreateCategory';

interface AddCategoryModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  subject: Subject;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  showModal,
  setShowModal,
  subject,
}) => {
  const [formData, setFormData] = useState<CreateCategoryData>({
    subject: subject._id,
    category: '',
    description: '',
  });

  const [error, setError] = useState<string | null>(null);
  const createCategoryMutation = useCreateCategory();
  const { user } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const resetForm = () => {
    setFormData({
      subject: '',
      category: '',
      description: '',
    });
    setError(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.subject) {
      setError('Subject is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }
    if (!formData.description) {
      setError('Description is required');
      return;
    }


    if (!user._id) {
      return toast.error("There is no user ID");
    }

    try {
      const keywordData: CreateCategoryData = {
        subject: formData.subject,
        category: formData.category,
        description: formData.description,
      };
      
      await createCategoryMutation.mutateAsync(keywordData);
      toast.success("Keyword created successfully");
      resetForm();
    } catch (error: any) {
      console.error('Error creating keyword:', error);
      setError(error.response?.data?.message || 'Failed to create keyword. Please try again.');
    }
  };

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
          <DialogTitle>Add Topic</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subject Selection */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Subject</label>
            <input
              type="text"
              name="name"
              value={subject.name}
              disabled={true}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Category *</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Enter category name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Description *</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Enter description"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <DialogFooter className="flex justify-between pt-4">
            <Button
              textButton="Submit"
              disabled={createCategoryMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {createCategoryMutation.isPending ? (
                <>
                  <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                  Submitting...
                </>
              ) : (
                "Submit"
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

export default AddCategoryModal; 