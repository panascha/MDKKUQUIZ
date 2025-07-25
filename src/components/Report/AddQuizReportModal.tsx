import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../ui/Dialog';
import Button from '../ui/Button';
import { LoaderIcon, X, PlusIcon } from "lucide-react";
import { UserProps } from '../../types/api/UserProps';
import { Quiz } from '../../types/api/Quiz';
import { useCreateQuiz } from '../../hooks/quiz/useCreateQuiz';
import { useCreateReport } from '../../hooks/report/useCreateReport';
import { Report } from '../../types/api/Report';
import toast from 'react-hot-toast';
import { useSession } from 'next-auth/react';
import { useUser } from '../../hooks/User/useUser';
import Image from 'next/image';
import { BACKEND_URL } from '../../config/apiRoutes';

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

  const addChoice = () => {
    setFormData(prev => ({
      ...prev,
      choice: [...prev.choice, '']
    }));
  };

  const removeChoice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      choice: prev.choice.filter((_, i) => i !== index)
    }));
  };

  const handleCorrectAnswerChange = (index: number, value: string) => {
    setFormData(prev => {
      if (prev.type === 'both' && index === 0) {
        // Only update the first correct answer, keep the rest
        const newAnswers = [...prev.correctAnswer];
        newAnswers[0] = value;
        return {
          ...prev,
          correctAnswer: newAnswers
        };
      }
      const newAnswers = [...prev.correctAnswer];
      newAnswers[index] = value;
      // Remove empty answers except for type 'both' index 0
      return {
        ...prev,
        correctAnswer: newAnswers.filter((answer, i) => prev.type === 'both' ? (i === 0 || answer.trim() !== '') : answer.trim() !== '')
      };
    });
  };

  const addCorrectAnswer = () => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: [...prev.correctAnswer, '']
    }));
  };

  const removeCorrectAnswer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: prev.correctAnswer.filter((_, i) => i !== index)
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
      const newReportData: Omit<Report, '_id' | 'createdAt' | 'updatedAt'> = {
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
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden max-h-[90vh] overflow-y-auto mt-8 flex flex-col">
        <DialogHeader>
          <DialogTitle>Report Quiz</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 pb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Original Question Section */}
          <div className="border-b pb-4 space-y-4">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                {Array.isArray(originalQuiz.img) ? (
                  originalQuiz.img.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={`${BACKEND_URL}${img}`}
                          alt={`Original image ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={`${BACKEND_URL}${originalQuiz.img}`}
                        alt="Original image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Suggested Changes Section */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Question</label>
            <textarea
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Enter your question"
              rows={3}
            />
          </div>

          {/* Choices or Written Answer */}
          {(formData.type === 'choice' || formData.type === 'both') && (
            <div>
              <label className="mb-1 block text-sm font-semibold">Choices</label>
              {formData.choice.map((choice, index) => (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer[0] === choice}
                    onChange={() => handleCorrectAnswerChange(0, choice)}
                    disabled={!choice.trim()}
                    className={`w-4 h-4 ${!choice.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  />
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                    required
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                    placeholder={`Choice ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => removeChoice(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove choice"
                    disabled={formData.choice.length <= 1}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
              ))}
                            <button
                type="button"
                onClick={addChoice}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Another Choice
              </button>
            </div>
          )}

          {(formData.type === 'written' || formData.type === 'both') && (
            <div>
              <label className="mb-1 block text-sm font-semibold">Correct Answers</label>
              {formData.correctAnswer.map((answer, index) => (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <textarea
                    value={answer}
                    onChange={(e) => handleCorrectAnswerChange(index, e.target.value)}
                    required
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
                    placeholder={`Correct Answer ${index + 1}`}
                    rows={2}
                    disabled={formData.type === 'both' && index === 0}
                  />
                  <button
                    type="button"
                    onClick={() => removeCorrectAnswer(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Remove answer"
                    disabled={formData.type === 'both' && index === 0}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addCorrectAnswer}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
              >
                <PlusIcon className="w-4 h-4" />
                Add Another Answer
              </button>
            </div>
          )}

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
              className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {newImage && (
              <div className="mt-4">
                <div className="relative group">
                  <div className="relative aspect-square w-32 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={URL.createObjectURL(newImage)}
                      alt="New image preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeNewImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  <p className="mt-1 text-xs text-gray-600 truncate">{newImage.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 pt-4 sticky bottom-0 bg-white">
            <Button
              type="submit"
              textButton="Submit Report"
              disabled={createQuizMutation.isPending || createReportMutation.isPending}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
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
                className="w-full sm:w-auto bg-red-500 hover:bg-red-800"
                onClick={resetForm}
              />
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuizReportModal; 