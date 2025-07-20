import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/Dialog';
import Button from '../ui/Button';
import { LoaderIcon } from "lucide-react";
import { UserProps } from '../../types/api/UserProps';
import { Keyword } from '../../types/api/Keyword';
import { useCreateKeyword } from '../../hooks/keyword/useCreateKeyword';
import { useCreateReport } from '../../hooks/report/useCreateReport';
import { Report } from '../../types/api/Report';
import toast from 'react-hot-toast';
import { useUser } from '../../hooks/User/useUser';

interface KeywordFormData {
  user: string;
  name: string;
  subject: string;
  category: string;
  keywords: Array<string>;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
}

interface AddKeywordReportModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  originalKeyword: Keyword;
  userProp: UserProps;
}

const AddKeywordReportModal: React.FC<AddKeywordReportModalProps> = ({
  showModal,
  setShowModal,
  originalKeyword,
  userProp,
}) => {
  const [formData, setFormData] = useState<KeywordFormData>({
    user: userProp._id,
    name: originalKeyword.name,
    subject: originalKeyword.subject._id,
    category: originalKeyword.category._id,
    keywords: originalKeyword.keywords,
    status: 'reported'
  });

  const [error, setError] = useState<string | null>(null);
  const createKeywordMutation = useCreateKeyword();
  const createReportMutation = useCreateReport();
  const { user } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleKeywordsChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((keyword, i) => i === index ? value : keyword)
    }));
  };

  const resetForm = () => {
    setFormData({
      user: userProp._id,
      name: originalKeyword.name,
      subject: originalKeyword.subject._id,
      category: originalKeyword.category._id,
      keywords: originalKeyword.keywords,
      status: 'reported'
    });
    setError(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user._id) {
      return toast.error("There is no user ID");
    }

    try {
      // Create the suggested keyword first
      const keywordResult = await createKeywordMutation.mutateAsync(formData);
      toast.success("Keyword created successfully");

      // Create the report with the new keyword ID
      const newReportData: Omit<Report, '_id' | 'createdAt' | 'updatedAt'> = {
        User: user._id,
        originalKeyword: originalKeyword,
        suggestedChangesKeyword: keywordResult,
        type: 'keyword',
        status: 'pending',
        reason: ''
      };

      // Submit the report
      await createReportMutation.mutateAsync(newReportData);
      toast.success("Report submitted successfully");
      
      // Close the modal after successful submission
      resetForm();
      
    } catch (error: any) {
      console.error('Error creating keyword or report:', error);
      setError(error.response?.data?.message || 'Failed to create report. Please try again.');
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
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden max-h-[90vh] flex flex-col mt-8">
        <DialogHeader>
          <DialogTitle>Report Keyword</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 overflow-y-auto pr-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Original Keyword Section */}
          <div className="border-b pb-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Subject</label>
              <input
                type="text"
                value={originalKeyword.subject.name}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Category</label>
              <input
                type="text"
                value={originalKeyword.category.category}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* Suggested Changes Section */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Keyword Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Keywords List */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Keywords</label>
            {formData.keywords.map((keyword, index) => (
              <div key={index} className="mb-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => handleKeywordsChange(index, e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  placeholder={`Keyword ${index + 1}`}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, keywords: [...prev.keywords, ''] }))}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            >
              + Add Keyword
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <DialogFooter className="flex justify-between pt-4 mt-auto border-t">
            <Button
              textButton="Submit Report"
              disabled={createKeywordMutation.isPending || createReportMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {createKeywordMutation.isPending || createReportMutation.isPending ? (
                <>
                  <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                  Submitting...
                </>
              ) : (
                "Submit Report"
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

export default AddKeywordReportModal; 