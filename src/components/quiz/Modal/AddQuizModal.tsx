import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../../ui/Dialog';
import Button from '../../ui/Button';
import { X, PlusIcon } from "lucide-react";
import { UserProps } from '../../../types/api/UserProps';
import { Category } from '../../../types/api/Category';
import { Subject } from '../../../types/api/Subject';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/DropdownMenu';
import { useUser } from '../../../hooks/User/useUser';
import toast from 'react-hot-toast';
import { CreateQuizData, useCreateQuiz } from '../../../hooks/quiz/useCreateQuiz';
import Image from 'next/image';
import { Keyword } from '../../../types/api/Keyword';
import { useGetKeyword } from '../../../hooks/keyword/useGetKeyword';
import { useGetQuizzes } from '../../../hooks/quiz/useGetQuizzes';
import { LoaderIcon } from 'lucide-react';
import { Quiz } from '../../../types/api/Quiz';

interface AddQuizModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  userProp: UserProps;
  subject: Subject[];
  category: Category[];
}

function filterKeywords(keywords: string[], value: string) {
  return keywords.filter(k => k.toLowerCase().includes(value.toLowerCase()));
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
    type: 'choice', 
    choice: ['', ''], 
    correctAnswer: [''], 
    img: [],
    status: 'pending'
  });

    const [error, setError] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const createQuizMutation = useCreateQuiz();
    const { user } = useUser();
    const getKeyword = useGetKeyword({ status: 'approved' });
    const getQuestionBySubjectandCategory = useGetQuizzes({
      subjectID: formData.subject,
      categoryID: formData.category
    });

    const [dropdown, setDropdown] = useState<{[key: string]: boolean}>({});
    const keywordOptions = formData.category
      ? Array.from(new Set(getKeyword?.data
        .filter((kw: Keyword) => kw.category && kw.category._id === formData.category)
        .flatMap((kw: Keyword) => kw.keywords) as string[]))
      : [];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        choice: value === 'choice' ? ['', ''] : [],
        correctAnswer: value === 'choice' ? [] : [''] 
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
  const removeChoice = (index: number) => {
    setFormData(prev => ({
      ...prev,
      choice: prev.choice.filter((_, i) => i !== index),
      correctAnswer: prev.correctAnswer.filter(answer => answer !== prev.choice[index])
    }));
  };

  const handleCorrectAnswerChange = (value: string, index: number) => {
    setFormData(prev => {
      if (prev.type === 'both' && index === 0) {
        const newAnswers = [...prev.correctAnswer];
        newAnswers[0] = value;
        return {
          ...prev,
          correctAnswer: newAnswers
        };
      }
      const newAnswers = [...prev.correctAnswer];
      newAnswers[index] = value;
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
    const files = Array.from(e.target.files || []);

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
      choice: ['', ''],
      correctAnswer: [''], // Reset to one empty answer
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
        choice: (formData.type === 'choice' || formData.type === 'both') ? formData.choice.map(c => c.trim()) : [],
        correctAnswer: formData.correctAnswer,
        img: [],
        status: 'pending',
        images: imageFiles 
      };

      await createQuizMutation.mutateAsync(quizData);
      toast.success("Quiz created successfully");
      resetForm();
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      setError(error.response?.data?.message || 'Failed to create quiz. Please try again.');
    }
  };

const usedCorrectAnswers = new Set(
  getQuestionBySubjectandCategory.data
    ?.filter((quiz: Quiz) => quiz.status === 'approved')
    .flatMap((quiz: Quiz) => quiz.correctAnswer) || []
);

const unusedKeywords: string[] = [...new Set(keywordOptions as string[])]
  .filter(keyword => !usedCorrectAnswers.has(keyword))
  .slice(0, 10);

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
          <DialogTitle>Add Quiz</DialogTitle>
          {/* Loading indicator for keywords/questions */}
          {(getKeyword.isLoading || getQuestionBySubjectandCategory.isLoading) && (formData.subject && formData.category) && (
            <div className="flex items-center gap-2 text-blue-600 my-2">
              <LoaderIcon className="animate-spin w-5 h-5" />
              <span>Loading suggestions...</span>
            </div>
          )}
          {/* Show unused keywords only when not loading */}
          {!(getKeyword.isLoading || getQuestionBySubjectandCategory.isLoading) && unusedKeywords.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">
                Here are some keywords that you can use as correct answers:
              </p>
                <div className="flex flex-col sm:flex-row flex-wrap sm:justify-between gap-2 sm:gap-0 max-h-40 overflow-y-auto">
                {/* First Column */}
                <ul className="w-1/2 pr-0 sm:pr-2 list-disc pl-5 text-xs sm:text-sm">
                  {unusedKeywords.slice(0, 4).map((keyword, index) => (
                  <li key={`col1-${index}`} className="text-gray-700 py-0.5 text-left">
                  {keyword}
                  </li>
                  ))}
                </ul>

                {unusedKeywords.length > 4 && (
                  <ul className="w-1/2 pl-0 sm:pl-2 list-disc text-xs sm:text-sm">
                  {unusedKeywords.slice(4, 8).map((keyword, index) => (
                  <li key={`col2-${index}`} className="text-gray-700 py-0.5 text-left">
                  {keyword}
                  </li>
                  ))}
                  </ul>
                )}
                </div>
            </div>
          )}
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4 pb-4"
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
                        category: '',
                        choice: ['', ''],
                        correctAnswer: [''],
                        img: [],
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
                      .filter(c => c.subject && c.subject._id === formData.subject)
                      .map((c) => (
                  <DropdownMenuItem
                    key={c._id}
                    className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      category: c._id,
                      choice: ['', ''],
                      correctAnswer: [''],
                      img: [],
                    }))}
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
          <div className="relative">
            <label className="mb-1 block text-sm font-semibold">Question *</label>
            <input
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              onFocus={() => setDropdown(d => ({ ...d, question: true }))}
              onBlur={() => setTimeout(() => setDropdown(d => ({ ...d, question: false })), 150)}
              required
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              placeholder="Enter your question"
              autoComplete="off"
            />
            {dropdown.question && filterKeywords(keywordOptions, formData.question).length > 0 && (
              <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
                {filterKeywords(keywordOptions, formData.question).map((keyword, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm text-gray-800"
                    onMouseDown={() => {
                      handleInputChange({ target: { name: 'question', value: keyword } } as any);
                      setDropdown(d => ({ ...d, question: false }));
                    }}
                  >
                    {keyword}
                  </div>
                ))}
              </div>
            )}
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
              <option value="both">Both</option>
            </select>
          </div>

          {/* Prepare keyword options for datalist */}
          {formData.category && (
            <datalist id="keyword-options">
              {getKeyword?.data
                .filter((kw: Keyword) => kw.category && kw.category._id === formData.category)
                .flatMap((kw: Keyword) => kw.keywords)
                .map((keyword: string, idx: number) => (
                  <option value={keyword} key={idx} />
                ))}
            </datalist>
          )}

          {formData.type === 'choice' || formData.type === 'both'? (
            <div>
                <label className="mb-1 block text-sm font-semibold">Choices *</label>
                {formData.choice.map((choice, index) => (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer.includes(choice)}
                  onChange={() => handleCorrectAnswerChange(choice, 0)}
                  disabled={!choice.trim()}
                  className={`w-4 h-4 ${!choice.trim() ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  />
                  <div className="relative flex-1">
                  <input
                    type="text"
                    value={choice}
                    onChange={e => handleChoiceChange(index, e.target.value)}
                    onFocus={() => setDropdown(d => ({ ...d, ['choice' + index]: true }))}
                    onBlur={() => setTimeout(() => setDropdown(d => ({ ...d, ['choice' + index]: false })), 150)}
                    required
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                    placeholder={`Choice ${index + 1}`}
                    autoComplete="off"
                  />
                  {dropdown['choice' + index] && filterKeywords(keywordOptions, choice).length > 0 && (
                    <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
                    {filterKeywords(keywordOptions, choice).map((keyword, kidx) => (
                      <div
                      key={kidx}
                      className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm text-gray-800"
                      onMouseDown={() => {
                        handleChoiceChange(index, keyword);
                        setDropdown(d => ({ ...d, ['choice' + index]: false }));
                      }}
                      >
                      {keyword}
                      </div>
                    ))}
                    </div>
                  )}
                  </div>
                          <button
                type="button"
                onClick={() => removeChoice(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors ml-2"
                title="Remove choice"
                disabled={formData.choice.length <= 1}
                >
                <X className="w-5 h-5" />
                </button>
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
          ) : null}

          {(formData.type === 'written' || formData.type === 'both') && (
            <div>
              <label className="mb-1 block text-sm font-semibold">Correct Answers *</label>
              {formData.correctAnswer.map((answer, index) => (
                <div key={index} className="mb-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={answer}
                      onChange={e => handleCorrectAnswerChange(e.target.value, index)}
                      onFocus={() => setDropdown(d => ({ ...d, ['answer' + index]: true }))}
                      onBlur={() => setTimeout(() => setDropdown(d => ({ ...d, ['answer' + index]: false })), 150)}
                      required
                      className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                      placeholder={`Correct Answer ${index + 1}`}
                      autoComplete="off"
                      disabled={formData.type === 'both' && index === 0}
                    />
                    {dropdown['answer' + index] && filterKeywords(keywordOptions, answer).length > 0 && (
                      <div className="absolute z-50 bg-white border border-gray-200 rounded shadow-lg mt-1 max-h-48 overflow-y-auto w-full">
                        {filterKeywords(keywordOptions, answer).map((keyword, kidx) => (
                          <div
                            key={kidx}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-100 text-sm text-gray-800"
                            onMouseDown={() => {
                              handleCorrectAnswerChange(keyword, index);
                              setDropdown(d => ({ ...d, ['answer' + index]: false }));
                            }}
                          >
                            {keyword}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
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
              className="w-full border border-gray-300 rounded-lg px-2 sm:px-3 py-2 text-sm file:mr-2 sm:file:mr-4 file:py-1 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
            />
            {imageFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
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
                      className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
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
          <DialogFooter className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4 pt-4 bottom-0 bg-white">
            <Button
              textButton="Submit"
              disabled={createQuizMutation.isPending}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600"
            >
              {createQuizMutation.isPending ? (
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

export default AddQuizModal;
