import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { LoaderIcon } from "lucide-react";
import Image from 'next/image';
import { UserProps } from '@/types/api/UserProps';
import { Quiz } from '@/types/api/Quiz';
import { useCreateQuiz } from '@/hooks/quiz/useCreateQuiz';

interface AddReportModalProps {
  editModal: boolean;
  setEditModal: (show: boolean) => void;
  reportData: {
    User: UserProps;
    originalQuiz: Quiz;
    suggestedChanges: Quiz;
    image: File | null;
    year: number;
  };
  quizData: Quiz;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  resetForm: () => void;
  error: string | null;
  editMutation: {
    isPending: boolean;
  };
  existingImg: string | null;
}

const AddReportModal: React.FC<AddReportModalProps> = ({
  editModal,
  setEditModal,
  reportData,
  quizData,
  handleInputChange,
  resetForm,
  error,
  editMutation,
  existingImg,
}) => {
  // State for suggested quiz
  const [suggestedQuiz, setSuggestedQuiz] = useState<Quiz>({
    ...quizData,
    _id: '', // New quiz will get new ID
    user: reportData.User,
    approved: false,
  });

  // State for new image
  const [newImage, setNewImage] = useState<File | null>(null);

  // Create quiz mutation
  const createQuizMutation = useCreateQuiz(suggestedQuiz);

  const handleSuggestedChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSuggestedQuiz(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    setSuggestedQuiz(prev => ({
      ...prev,
      choice: prev.choice.map((choice, i) => i === index ? value : choice)
    }));
  };

  const handleCorrectAnswerChange = (index: number, value: string) => {
    setSuggestedQuiz(prev => ({
      ...prev,
      correctAnswer: prev.correctAnswer.map((answer, i) => i === index ? value : answer)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create the suggested quiz
      const result = await createQuizMutation.mutateAsync();
      
      // Get the created quiz ID from the result
      const suggestedQuizId = result._id;
      
      // Update the report data with the new quiz ID
      const updatedReportData = {
        ...reportData,
        suggestedQuiz: {
          ...suggestedQuiz,
          _id: suggestedQuizId
        },
        image: newImage
      };
      
      // Here you would submit the report with the updated data
      // You'll need to implement the report submission logic
      
      // Close the modal after successful submission
      setEditModal(false);
      resetForm();
      
    } catch (error) {
      console.error('Error creating quiz:', error);
      // Handle error appropriately
    }
  };

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
          <DialogTitle>Report</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Original Question Section */}
          <div className="border-b pb-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Subject</label>
              <input
                type="text"
                value={quizData.subject.name}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Category</label>
              <input
                type="text"
                value={quizData.category.category}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Type</label>
              <input
                type="text"
                value={quizData.type}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* Suggested Changes Section */}
          <div className="border-b pb-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Question</label>
              <input
                type="text"
                name="question"
                value={suggestedQuiz.question}
                onChange={handleSuggestedChange}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            {/* Choices */}
            {quizData.choice? (
            <div>
              <label className="mb-1 block text-sm font-semibold">Choices</label>
              {suggestedQuiz.choice.map((choice, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>
            ): (null)}
            {/* Correct Answers */}
            <div>
              <label className="mb-1 block text-sm font-semibold">Correct Answers</label>
              {suggestedQuiz.correctAnswer.map((answer, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
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
                onChange={handleImageChange}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              {newImage && (
                <p className="text-sm text-gray-600">Selected: {newImage.name}</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <DialogFooter className="flex justify-between pt-4">
            <Button
              textButton="Submit Report"
              disabled={editMutation.isPending}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {editMutation.isPending ? (
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

export default AddReportModal; 