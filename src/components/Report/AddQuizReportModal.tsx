import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { LoaderIcon, X } from "lucide-react";
import { UserProps } from '@/types/api/UserProps';
import { Quiz } from '@/types/api/Quiz';
import { useCreateQuiz } from '@/hooks/quiz/useCreateQuiz';
import { useCreateReport } from '@/hooks/report/useCreateReport';
import { Report } from '@/types/api/Report';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useUser } from '@/hooks/useUser';
import Image from 'next/image';
import ImageGallery from '@/components/magicui/ImageGallery';

interface QuizFormData {
  user: string;
  subject: string;
  category: string;
  choice: Array<string>;
  correctAnswer: Array<string>;
  img: Array<string>;
  question: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'reported';
}

interface AddReportModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  originalQuiz: Quiz;
  userProp: UserProps;
}

const AddQuizReportModal: React.FC<AddReportModalProps> = ({
  showModal,
  setShowModal,
  originalQuiz,
  userProp,
}) => {
  // State for suggested quiz
  const [formData, setFormData] = useState<QuizFormData>({
    user: userProp._id,
    subject: originalQuiz.subject._id,
    category: originalQuiz.category._id,
    choice: originalQuiz.choice,
    correctAnswer: originalQuiz.correctAnswer,
    img: originalQuiz.img,
    question: originalQuiz.question,
    type: originalQuiz.type,
    status: 'reported'
  });

  // State for new image
  const [newImage, setNewImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Create quiz mutation
  const createQuizMutation = useCreateQuiz();
  // Create report mutation
  const createReportMutation = useCreateReport();
  const session = useSession();
  const { user } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChoiceChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      choice: prev.choice.map((choice, i) => i === index ? value : choice)
    }));
  };

  const handleCorrectAnswerChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: prev.correctAnswer.map((answer, i) => i === index ? value : answer)
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      setNewImage(file);
      setError(null);
    }
  };

  const removeNewImage = () => {
    setNewImage(null);
  };

  const resetForm = () => {
        setFormData({
        user: userProp._id,
        subject: originalQuiz.subject._id,
        category: originalQuiz.category._id,
        choice: originalQuiz.choice,
        correctAnswer: originalQuiz.correctAnswer,
        img: originalQuiz.img,
        question: originalQuiz.question,
        type: originalQuiz.type,
        status: 'reported'
    });
    setNewImage(null);
    setError(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if(!user._id){
      return toast.error("there is no user ID");
    }
    try {
      // Create the suggested quiz first
      const quizResult = await createQuizMutation.mutateAsync(formData);
      toast.success("create quiz success");
      // Create the report with the new quiz ID
      const newReportData: Omit<Report, '_id' | 'createdAt'> = {
        User: user._id,
        originalQuiz: originalQuiz,
        suggestedChanges: quizResult,
        type: 'quiz',
        status: 'pending',
        reason: ''
      };

      // Submit the report
      await createReportMutation.mutateAsync(newReportData);
      
      // Close the modal after successful submission
      resetForm();
      
    } catch (error) {
      console.error('Error creating quiz or report:', error);
      setError('Failed to create report. Please try again.');
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
          <DialogTitle>Report Quiz</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 overflow-y-auto pr-2"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Original Question Section */}
          <div className="border-b pb-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Subject</label>
              <input
                type="text"
                value={originalQuiz.subject.name}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Category</label>
              <input
                type="text"
                value={originalQuiz.category.category}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Type</label>
              <input
                type="text"
                value={originalQuiz.type}
                disabled={true}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* Original Images Section */}
          {originalQuiz.img && originalQuiz.img.length > 0 && (
            <div className="border-b pb-4">
              <label className="mb-2 block text-sm font-semibold">Original Images</label>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(originalQuiz.img) ? (
                  originalQuiz.img.map((img, index) => (
                    <div key={index} className="relative w-24 h-24">
                      <Image
                        src={`http://localhost:5000${img}`}
                        alt={`Original image ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ))
                ) : (
                  <div className="relative w-24 h-24">
                    <Image
                      src={`http://localhost:5000${originalQuiz.img}`}
                      alt="Original image"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggested Changes Section */}
          <div className="border-b pb-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Question</label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            {/* Choices */}
            {originalQuiz.choice ? (
              <div>
                <label className="mb-1 block text-sm font-semibold">Choices</label>
                {formData.choice.map((choice, index) => (
                  <div key={index} className="mb-2">
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => handleChoiceChange(index, e.target.value)}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {/* Correct Answers */}
            <div>
              <label className="mb-1 block text-sm font-semibold">Correct Answers</label>
              {formData.correctAnswer.map((answer, index) => (
                <div key={index} className="mb-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              ))}
            </div>

            {/* New Image Upload */}
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
                <div className="mt-2">
                  <div className="relative aspect-square w-32">
                    <Image
                      src={URL.createObjectURL(newImage)}
                      alt="New image preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeNewImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{newImage.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </form>

        {/* Buttons - Fixed at bottom */}
        <DialogFooter className="flex justify-between pt-4 mt-auto border-t">
          <Button
            textButton="Submit Report"
            disabled={createQuizMutation.isPending || createReportMutation.isPending}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {createQuizMutation.isPending || createReportMutation.isPending ? (
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
      </DialogContent>
    </Dialog>
  );
};

export default AddQuizReportModal; 