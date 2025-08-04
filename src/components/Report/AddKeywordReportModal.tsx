import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/Dialog';
import Button from '../ui/Button';
import { LoaderIcon, X } from "lucide-react";
import { UserProps } from '../../types/api/UserProps';
import { Keyword } from '../../types/api/Keyword';
import { useCreateKeyword, CreateKeywordData } from '../../hooks/keyword/useCreateKeyword';
import { useCreateReport } from '../../hooks/report/useCreateReport';
import { Report } from '../../types/api/Report';
import toast from 'react-hot-toast';
import { useUser } from '../../hooks/User/useUser';


interface KeywordFormData {
  user: string;
  name: string;
  subject?: string;
  category?: string;
  keywords: Array<string>;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
  isGlobal?: boolean;
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
    keywords: originalKeyword.keywords,
    status: 'reported',
    isGlobal: originalKeyword.isGlobal,
    ...(originalKeyword.isGlobal ? {} : {
      subject: originalKeyword.subject?._id,
      category: originalKeyword.category?._id
    })
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
      keywords: originalKeyword.keywords,
      status: 'reported',
      isGlobal: originalKeyword.isGlobal,
      ...(originalKeyword.isGlobal ? {} : {
        subject: originalKeyword.subject?._id,
        category: originalKeyword.category?._id
      })
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
      const keywordData: CreateKeywordData = {
        user: user._id,
        name: formData.name,
        keywords: formData.keywords,
        status: 'reported',
        isGlobal: formData.isGlobal,
        ...(formData.isGlobal ? {} : {
          subject: formData.subject,
          category: formData.category
        })
      };
      
      const keywordResult = await createKeywordMutation.mutateAsync(keywordData);
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

    const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
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
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden max-h-[90vh] flex flex-col mt-8 overflow-y-auto">
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
            {originalKeyword.isGlobal ? (
              <div>
                <label className="mb-1 block text-sm font-semibold">Type</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="Global Keyword"
                    disabled={true}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-blue-50 text-blue-700"
                  />
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs rounded">
                    Global
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Subject</label>
                  <input
                    type="text"
                    value={originalKeyword.subject?.name || ''}
                    disabled={true}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold">Category</label>
                  <input
                    type="text"
                    value={originalKeyword.category?.category || ''}
                    disabled={true}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
              </>
            )}
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
              <div key={index} className="mb-2 flex items-center">
              <input
                type="text"
                value={keyword}
                onChange={(e) => handleKeywordsChange(index, e.target.value)}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder={`Keyword ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                title="Remove keyword"
                disabled={formData.keywords.length <= 1}
              >
                <X className="w-5 h-5" />
              </button>
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