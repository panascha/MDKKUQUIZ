import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { LoaderIcon, ImageIcon, X } from "lucide-react";
import { UserProps } from '@/types/api/UserProps';
import { Category } from '@/types/api/Category';
import { Subject } from '@/types/api/Subject';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { useUser } from '@/hooks/useUser';
import toast from 'react-hot-toast';
import { CreateQuizData, useCreateQuiz } from '@/hooks/quiz/useCreateQuiz';
import Image from 'next/image';

interface AddQuizModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  userProp: UserProps;
  subject: Subject[];
  category: Category[];
}

const AddQuizModal: React.FC<AddQuizModalProps> = ({
  showModal,
  setShowModal,
  userProp,
  subject,
  category
}) => {
  const [formData, setFormData] = useState<CreateQuizData>({
    user: userProp._id,
    question: '',
    subject: '',
    category: '',
    type: 'choice', // default type
    choice: ['', '', '', ''], // default 4 choices for choice type
    correctAnswer: [],
    img: [],
    status: 'pending'
  });

    const [error, setError] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const createQuizMutation = useCreateQuiz();
    const { user } = useUser();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      // Reset choices and correct answer when type changes
      setFormData(prev => ({
        ...prev,
        [name]: value,
        choice: value === 'choice' ? ['', '', '', ''] : [],
        correctAnswer: []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleChoiceChange = (index: number, value: string) => {
    setFormData(prev => {
      const newChoices = prev.choice.map((choice, i) => i === index ? value : choice);
      // If the choice being edited is the correct answer and it's being cleared,
      // remove it from correctAnswer
      if (prev.correctAnswer.includes(prev.choice[index]) && !value.trim()) {
        return {
          ...prev,
          choice: newChoices,
          correctAnswer: []
        };
      }
      return {
        ...prev,
        choice: newChoices
      };
    });
  };

  const handleCorrectAnswerChange = (value: string) => {
    // Only allow setting correct answer if the choice is not empty
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        correctAnswer: [value]
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const invalidFiles = files.filter(file => 
      !file.type.startsWith('image/') || 
      !['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
    );

    if (invalidFiles.length > 0) {
      setError('Only JPG, PNG and GIF images are allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({
      user: userProp._id,
      question: '',
      subject: '',
      category: '',
      type: 'choice',
      choice: ['', '', '', ''],
      correctAnswer: [],
      img: [],
      status: 'pending'
    });
    setError(null);
    setImageFiles([]);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.question.trim()) {
      setError('Question is required');
      return;
    }
    if (!formData.subject) {
      setError('Subject is required');
      return;
    }
    if (!formData.category) {
      setError('Category is required');
      return;
    }

    // Type-specific validation
    if (formData.type === 'choice') {
      if (!formData.choice.some(c => c.trim())) {
        setError('At least one choice is required');
        return;
      }
      if (formData.correctAnswer.length === 0) {
        setError('Please select a correct answer');
        return;
      }
    } else if (formData.type === 'written') {
      if (!formData.correctAnswer[0]?.trim()) {
        setError('Correct answer is required for written questions');
        return;
      }
    }

    if (!user._id) {
      return toast.error("There is no user ID");
    }

    try {
      const quizData: CreateQuizData = {
        user: user._id,
        question: formData.question.trim(),
        subject: formData.subject,
        category: formData.category,
        type: formData.type,
        choice: formData.type === 'choice' ? formData.choice.map(c => c.trim()) : [],
        correctAnswer: formData.correctAnswer,
        img: [], // This will be handled by the backend
        status: 'pending',
        images: imageFiles // Add the image files to the quiz data
      };

      await createQuizMutation.mutateAsync(quizData);
      toast.success("Quiz created successfully");
      resetForm();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz. Please try again.');
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
          <DialogTitle>Add Quiz</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Subject Selection */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Subject *</label>
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full text-left hover:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer">
                {formData.subject ? subject.find(s => s._id === formData.subject)?.name : 'Select Subject'}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-white">
                {subject.map((s) => (
                  <DropdownMenuItem
                    key={s._id}
                    className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                    onClick={() => {
                      setFormData(prev => ({ 
                        ...prev, 
                        subject: s._id,
                        category: '' // Reset category when subject changes
                      }));
                    }}
                  >
                    {s.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Category Selection */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Category *</label>
            <DropdownMenu>
              <DropdownMenuTrigger 
                className={`w-full text-left hover:bg-gray-200 border border-gray-300 rounded-md p-2 transition duration-300 ease-in-out cursor-pointer ${
                  !formData.subject ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={!formData.subject}
              >
                {!formData.subject 
                  ? 'Select Subject First' 
                  : formData.category 
                    ? category.find(c => c._id === formData.category)?.category 
                    : 'Select Category'}
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full bg-white">
                {formData.subject && (
                  <>
                    {category
                      .filter(c => c.subject._id === formData.subject)
                      .map((c) => (
                        <DropdownMenuItem
                          key={c._id}
                          className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                          onClick={() => setFormData(prev => ({ ...prev, category: c._id }))}
                        >
                          {c.category}
                        </DropdownMenuItem>
                      ))}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Question */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Question *</label>
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

          {/* Question Type */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Question Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="choice">MCQ</option>
              <option value="written">Written Answer</option>
            </select>
          </div>

          {/* Choices or Written Answer */}
          {formData.type === 'choice' ? (
            <div>
              <label className="mb-1 block text-sm font-semibold">Choices *</label>
              {formData.choice.map((choice, index) => (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer.includes(choice)}
                    onChange={() => handleCorrectAnswerChange(choice)}
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
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, choice: [...prev.choice, ''] }))}
                className="mt-2 text-sm text-blue-500 hover:text-blue-700"
              >
                + Add Choice
              </button>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-semibold">Correct Answer *</label>
              <textarea
                name="correctAnswer"
                value={formData.correctAnswer[0] || ''}
                onChange={(e) => handleCorrectAnswerChange(e.target.value)}
                required
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                placeholder="Enter the correct answer"
                rows={3}
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label htmlFor="images" className="mb-1 block text-sm font-semibold">
              Upload Images (Optional)
            </label>
            <input
              type="file"
              name="images"
              id="images"
              accept="image/*"
              onChange={handleImageChange}
              multiple
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="mt-1 text-xs text-gray-600 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            )}
            {error && error.includes('image') && (
              <p className="text-red-500 text-sm">Please upload valid images.</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Buttons */}
          <DialogFooter className="flex justify-between pt-4">
            <Button
              textButton="Submit"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Submit
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

export default AddQuizModal;
