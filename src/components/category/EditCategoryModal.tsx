import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { LoaderIcon } from "lucide-react";
import { Category } from '@/types/api/Category';
import { Subject } from '@/types/api/Subject';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';
import { EditCategoryData, useEditCategory } from '@/hooks/category/useEditCategory';

interface EditCategoryModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  subject: Subject;
  category: Category;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  showModal,
  setShowModal,
  subject,
  category,
}) => {
  const [formData, setFormData] = useState<EditCategoryData>({
    subject: subject._id,
    category: category.category,
    description: category.description,
  });

  const [error, setError] = useState<string | null>(null);
  const editCategoryMutation = useEditCategory(category._id);
  const { user } = useUser();

  useEffect(() => {
    if (category) {
      setFormData({
        subject: subject._id,
        category: category.category,
        description: category.description,
      });
    }
  }, [category, subject._id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      subject: subject._id,
      category: category.category,
      description: category.description,
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
      const categoryData: EditCategoryData = {
        subject: formData.subject,
        category: formData.category,
        description: formData.description,
      };
      
      await editCategoryMutation.mutateAsync(categoryData);
      toast.success("Category updated successfully");
      resetForm();
    } catch (error: any) {
      console.error('Error updating category:', error);
      setError(error.response?.data?.message || 'Failed to update category. Please try again.');
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
          <DialogTitle>Edit Topic</DialogTitle>
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
              textButton="Update"
              disabled={editCategoryMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {editCategoryMutation.isPending ? (
                <>
                  <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                  Updating...
                </>
              ) : (
                "Update"
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

export default EditCategoryModal; 