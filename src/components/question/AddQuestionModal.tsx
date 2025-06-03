import React from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { LoaderIcon } from "lucide-react";
import { Subject } from '@/types/api/Subject';
import { Category } from '@/types/api/Category';

interface AddSubjectModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
    formData: {
        question: string;
        subject: Subject;
        category: Category;
        type: string;
        choice: string[];
        correctAnswer: string[];
        image: File | null;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  error: string | null;
  createMutation: {
    isPending: boolean;
    };
    subjectOptions: Subject[];
    categoryOptions: Category[];
    questionTypeOptions: { label: string; value: string }[];
}

const AddQuestionModal: React.FC<AddSubjectModalProps> = ({
  showModal,
  setShowModal,
  formData,
  handleInputChange,
  handleSubmit,
  resetForm,
  error,
    createMutation,
    subjectOptions,
    categoryOptions,
    questionTypeOptions,
  
}) => {
    console.log("AddQuestionModal render", formData, showModal);

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
      <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden overflow-y-auto max-h-[90vh] z-999">
        <DialogHeader>
          <DialogTitle>Add Question</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="w-full space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Question Input */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Question</label>
            <textarea
              id="question"
              name="question"
              value={formData.question}
              onChange={handleInputChange}
              placeholder="Question"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            />
          </div>

          {/* Subject Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Subject</label>
            <select
              id="subject"
              name="subject"
              value={formData.subject?._id}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            >
              <option value="" disabled>Select a subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject._id} value={subject._id}>{subject.name}</option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category?._id}
              onChange={handleInputChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            >
              <option value="" disabled>Select a category</option>
              {formData.subject && formData.subject._id ? (
                subjectOptions.find(subject => subject._id === formData.subject._id)?.Category.map((category) => (
                  <option key={category._id} value={category._id}>{category.category}</option>
                ))
              ) : categoryOptions.map((category) => (
                <option key={category._id} value={category._id}>{category.category}</option>
              ))}
            </select>
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={(e) => {
                handleInputChange(e);
                // Clear choices and correct answers when question type changes
                handleInputChange({
                  target: {
                    name: 'choice',
                    value: [],
                  },
                } as any);
                handleInputChange({
                  target: {
                    name: 'correctAnswer',
                    value: [],
                  },
                } as any);
              }}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              required
            >
              {questionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Choices Input (Conditional) */}
          {(formData.type === 'both' || formData.type === 'choice') && (
            <div>
              <label className="mb-1 block text-sm font-semibold">Choices</label>
              {formData.choice.map((choice, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    name={`choice`}
                    value={choice}
                    onChange={(e) => {
                      const newChoices = [...formData.choice];
                      newChoices[index] = e.target.value;
                      handleInputChange({
                        target: {
                          name: 'choice',
                          value: newChoices,
                        },
                      } as any);
                    }}
                    placeholder={`Choice ${index + 1}`}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                    required // Require choices when the type is choice or both
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newChoices = [...formData.choice];
                      newChoices.splice(index, 1);
                      handleInputChange({
                        target: {
                          name: 'choice',
                          value: newChoices,
                        },
                      } as any);
                    }}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition duration-200 ease-in-out"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  handleInputChange({
                    target: {
                      name: 'choice',
                      value: [...formData.choice, ''],
                    },
                  } as any);
                }}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 mt-2 rounded transition duration-200 ease-in-out"
              >
                +
              </button>
              {formData.choice.length === 0 && <p className="text-red-500 text-sm">At least one choice is required.</p>}
            </div>
          )}

          {/* Correct Answer Input */}
          <div>
            <label className="mb-1 block text-sm font-semibold">Correct Answer</label>
            {formData.type === 'written' ? (
              <div>
                {formData.correctAnswer.map((answer, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      name={`correctAnswer`}
                      value={answer}
                      onChange={(e) => {
                        const newCorrectAnswers = [...formData.correctAnswer];
                        newCorrectAnswers[index] = e.target.value;
                        handleInputChange({
                          target: {
                            name: 'correctAnswer',
                            value: newCorrectAnswers,
                          },
                        } as any);
                      }}
                      placeholder={`Correct Answer ${index + 1}`}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newCorrectAnswers = [...formData.correctAnswer];
                        newCorrectAnswers.splice(index, 1);
                        handleInputChange({
                          target: {
                            name: 'correctAnswer',
                            value: newCorrectAnswers,
                          },
                        } as any);
                      }}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition duration-200 ease-in-out"
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange({
                      target: {
                        name: 'correctAnswer',
                        value: [...formData.correctAnswer, ''],
                      },
                    } as any);
                  }}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded transition duration-200 ease-in-out"
                >
                  +
                </button>
              </div>
            ) : (
              (formData.type === 'both' || formData.type === 'choice') ? (
                <div>
                  <div className="flex flex-wrap gap-2">
                    {formData.choice.map((choice, index) => (
                      <button
                        key={index}
                        type="button"
                            className={`rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors duration-200 ease-in-out hover:bg-sky-600 hover:text-white
                            ${formData.correctAnswer.includes(choice) ? 'bg-sky-500 text-white' : 'bg-white text-gray-700'
                          }`}
                        onClick={() => {
                          const newCorrectAnswers = [...formData.correctAnswer];
                          const choiceIndex = newCorrectAnswers.indexOf(choice);

                          if (choiceIndex === -1) {
                            newCorrectAnswers.push(choice);
                          } else {
                            newCorrectAnswers.splice(choiceIndex, 1);
                          }

                          handleInputChange({
                            target: {
                              name: 'correctAnswer',
                              value: newCorrectAnswers,
                            },
                          } as any);
                        }}
                      >
                        {choice}
                      </button>
                    ))}
                  </div>
                  {formData.choice.find(choice => formData.correctAnswer.includes(choice)) === undefined && (
                    <p className="text-red-500 text-sm">At least one correct answer must be selected.</p>
                  )}
                  {formData.type === 'both' && (
                    <label className="mb-1 block text-sm font-semibold">Possible Answer</label>
                  )}
                  {formData.type === 'both' && formData.correctAnswer.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        name={`correctAnswer`}
                        value={answer}
                        onChange={(e) => {
                          const newCorrectAnswers = [...formData.correctAnswer];
                          newCorrectAnswers[index] = e.target.value;
                          handleInputChange({
                            target: {
                              name: 'correctAnswer',
                              value: newCorrectAnswers,
                            },
                          } as any);
                        }}
                        placeholder={`Correct Answer ${index + 1}`}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCorrectAnswers = [...formData.correctAnswer];
                          newCorrectAnswers.splice(index, 1);
                          handleInputChange({
                            target: {
                              name: 'correctAnswer',
                              value: newCorrectAnswers,
                            },
                          } as any);
                        }}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded transition duration-200 ease-in-out"
                      >
                        -
                      </button>
                    </div>
                  ))}
                  {formData.type === 'both' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange({
                          target: {
                            name: 'correctAnswer',
                            value: [...formData.correctAnswer, ''],
                          },
                        } as any);
                      }}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold mt-2 py-1 px-3 rounded transition duration-200 ease-in-out"
                    >
                      +
                    </button>
                  )}
                </div>
              ) : null
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
          </div>

          {/* Submit Button */}
          <DialogFooter className="flex justify-between pt-4">
            <Button
              disabled={createMutation.isPending || (formData.type === 'both' || formData.type === 'choice' && formData.choice.length === 0)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg px-4 py-2"
              textButton={createMutation.isPending ? "Saving..." : "Add Question"}
            >
              {createMutation.isPending ? (
                <>
                  <LoaderIcon className="mr-2 inline animate-spin" size={16} />

                </>
              ) : (
                "Add Question"
              )}
            </Button>

            {/* Cancel Button */}
            <DialogClose asChild>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2"
                onClick={resetForm}
                textButton='Cancel'
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddQuestionModal;