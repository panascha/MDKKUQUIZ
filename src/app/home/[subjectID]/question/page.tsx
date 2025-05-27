"use client";
import React, { useState,useCallback } from 'react';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { BackendRoutes, FrontendRoutes } from '@/config/apiRoutes';
import { Quiz } from '@/types/api/Quiz';
import { Subject } from '@/types/api/Subject';
import ProtectedPage from '@/components/ProtectPage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import Table from '@/components/ui/Table';
import { IoIosArrowBack } from "react-icons/io";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { LoaderIcon } from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { Category } from '@/types/api/Category';
import Link from 'next/link';

const Question = () => {
    const router = useRouter();
    const params = useParams();
    const subjectID = params.subjectID;

    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [questions, setQuestions] = useState<Quiz[]>([]);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (!subjectID) return;
        if (!session) return;

        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(BackendRoutes.QUIZ, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                    params: {
                        subjectID: subjectID,
                    },
                });
                setQuestions(response.data.data);
                setIsLoading(false);
            }
            catch (err) {
                setError("Failed to fetch questions.");
                setIsLoading(false);
            }
        };
        fetchQuestions();

        const fetchSubjects = async () => {
            try {
                const response = await axios.get(BackendRoutes.SUBJECT, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                });
                setSubjects(response.data.data);
            } catch (err) {
                setError("Failed to fetch subjects.");
            }
        };
        fetchSubjects();

        const fetchCategories = async () => {
            try {
                const response = await axios.get(BackendRoutes.CATEGORY, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                });
                setCategories(response.data.data);
            } catch (err) {
                setError("Failed to fetch categories.");
            }
        };
        fetchCategories();
    }, [subjectID, session]);

    
    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(subjectID as string | null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    type FilterOptions = {
        searchTerm: string;
        selectedSubject: string | null;
        selectedCategory: string | null;
    };

    const useFilteredQuestions = (
        questions: Quiz[] | null,
        { searchTerm, selectedSubject, selectedCategory }: FilterOptions
    ) => {
        const [filteredQuestions, setFilteredQuestions] = useState<Quiz[]>([]);

        const filterQuestions = useCallback(
            (
                currentQuestions: Quiz[] | null,
                currentSearchTerm: string,
                currentSubject: string | null,
                currentCategory: string | null
            ) => {
                if (!currentQuestions || currentQuestions.length === 0) {
                    return [];
                }
                const operators = ['and', 'or', 'not'];
                const searchTerms =
                    currentSearchTerm
                        .match(/(?:[^\s"“”]+|"[^"]*"|“[^”]*”)+/g)
                        ?.map(term => term.replace(/["“”]/g, '').toLowerCase()) || [];
                // it works for some reason do to fix
                const subjectFilter = (q: Quiz) => {
                    // console.log(q.subject, currentSubject);
                    return !currentSubject || (q.subject._id === currentSubject);
                };
                const categoryFilter = (q: Quiz) => {
                    // console.log(q.category, currentCategory);
                    return !currentCategory || (q.category._id === currentCategory);
                };

                if (!searchTerms.length) {
                    // console.log("No search terms provided, returning all questions", currentQuestions.filter(q => subjectFilter(q) && categoryFilter(q)));
                    return currentQuestions.filter(q => subjectFilter(q) && categoryFilter(q));
                }

                return currentQuestions.filter(q => {
                    let includeQuestion: boolean | null = null;
                    let currentOperator = 'or';

                    for (let i = 0; i < searchTerms.length; i++) {
                        const term = searchTerms[i];

                        if (operators.includes(term)) {
                            currentOperator = term;
                            continue;
                        }

                        const termInQuestion =
                            (q.question && q.question.toLowerCase().includes(term)) ||
                            (Array.isArray(q.choice) && q.choice.some(c => c.toLowerCase().includes(term))) ||
                            (Array.isArray(q.correctAnswer) && q.correctAnswer.some(a => a.toLowerCase().includes(term)));

                        if (includeQuestion === null) {
                            includeQuestion = termInQuestion;
                        } else if (currentOperator === 'and') {
                            includeQuestion = includeQuestion && termInQuestion;
                        } else if (currentOperator === 'or') {
                            includeQuestion = includeQuestion || termInQuestion;
                        } else if (currentOperator === 'not') {
                            includeQuestion = includeQuestion && !termInQuestion;
                        }
                    }
                    return !!includeQuestion && subjectFilter(q) && categoryFilter(q);
                });
            },
            []
        );

        useEffect(() => {
            setFilteredQuestions(
                filterQuestions(questions, searchTerm, selectedSubject, selectedCategory)
            );
        }, [questions, searchTerm, selectedSubject, selectedCategory, filterQuestions]);

        return filteredQuestions;
    };

    const filteredQuestions = useFilteredQuestions(questions, {
        searchTerm,
        selectedSubject,
        selectedCategory,
    });

    const [showModal, setShowModal] = useState(false);

    

    if (isLoading) {
        return (
            <div className="flex items-center justify-center gap-3 pt-10">
              <LoaderIcon /> Loading...
            </div>
          );          
    }
    
    if (error) {
        return (
            <div className="text-red-500 flex items-center gap-2 pt-4">
              <span>Error:</span> {error}
            </div>
          );          
    }

    if (!questions) {
        return (
            <div className="text-red-500 pt-4">Questions not found</div>
          );          
    }


    return (
        <ProtectedPage>
            <div className="container mx-auto p-4 mt-20 justify-center items-center flex flex-col">
                <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                    <Link href={`${FrontendRoutes.HOMEPAGE}/${subjectID}`}>
                    <button className="flex items-center mb-4 hover:bg-orange-400 hover:text-white p-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                        <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                    </button>
                    </Link>
                </div>
                <div className='absolute top-22 md:top-25 right-4 md:right-15'>
                    <button onClick={() => router.push(FrontendRoutes.QUESTION_CREATE)} className="border-1 mb-4 hover:bg-green-600 hover:text-white pl-2 p-3 rounded-sm transition duration-300 ease-in-out hover:opacity-60 cursor-pointer">
                        + Create
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-center mb-4">Question List</h1>

                {/* Search and filter section */}
                <section className="flex flex-col gap-4 mt-3 mx-auto p-2 sm:p-4 md:p-6 w-full max-w-5xl items-center justify-center md:flex-row md:justify-between">
                    <div className="flex flex-col gap-2 w-full md:w-7/12">
                        <label htmlFor="search" className="text-sm md:text-md text-center md:text-left">
                            Search:
                            <small className="ml-2 text-gray-500">
                                Try Pubmed search e.g. "strongyloides" and/or/not "hookworm"
                            </small>
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Search from Question, Choice, Answer"
                            className="border border-gray-300 rounded-md p-2 w-full"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-5/12 md:flex-row md:gap-4">
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm md:text-md text-center md:text-left hidden md:block">
                                Filter subject:
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="hover:bg-gray-200 border border-gray-300 rounded-md p-2 w-full transition duration-300 ease-in-out cursor-pointer">
                                    {selectedSubject
                                        ? (
                                            <span className="md:text-base text-sm">
                                                {subjects.find((subject) => subject._id === selectedSubject)?.name}
                                            </span>
                                        )
                                        : <span className="md:text-base text-sm">All Subjects</span>
                                    }
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 sm:w-56 bg-white">
                                    <DropdownMenuItem className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out">
                                        <span onClick={() => setSelectedSubject(null)}>All Subjects</span>
                                    </DropdownMenuItem>
                                    {subjects.map((subject) => (
                                        <DropdownMenuItem className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                                            key={subject._id}
                                            onClick={() => setSelectedSubject(subject._id)}
                                        >
                                            {subject.name}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <label className="text-sm md:text-md text-center md:text-left hidden md:block">
                                Filter topic:
                            </label>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="hover:bg-gray-200 border border-gray-300 rounded-md p-2 w-full transition duration-300 ease-in-out cursor-pointer">
                                    {selectedCategory
                                        ? (
                                            <span className="md:text-base text-sm">
                                                {categories.find((category) => category._id === selectedCategory)?.category}
                                            </span>
                                        )
                                        : <span className="md:text-base text-sm">All Topics</span>
                                    }
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-48 sm:w-56 bg-white">
                                    <DropdownMenuItem
                                        className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                                        onClick={() => setSelectedCategory(null)}
                                    >
                                        All Topics
                                    </DropdownMenuItem>
                                    {(
                                        selectedSubject
                                            ? (subjects.find(subject => subject._id === selectedSubject)?.Category ?? [])
                                            : categories
                                    ).map(category => (
                                        <DropdownMenuItem
                                            className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                                            key={category._id}
                                            onClick={() => setSelectedCategory(category._id)}
                                        >
                                            {category.category}
                                        </DropdownMenuItem>
                                    ))}
                                    {/* {(selectedSubject
                                        ? categories.filter(category => category.subject?._id === selectedSubject)
                                        : categories
                                    ).map(category => (
                                        <DropdownMenuItem
                                            className="cursor-pointer hover:bg-gray-200 transition duration-300 ease-in-out"
                                            key={category._id}
                                            onClick={() => setSelectedCategory(category._id)}
                                        >
                                            {category.category}
                                        </DropdownMenuItem>
                                    ))} */}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </section>
                <Table headers={["#", "question", "answer"]} data={filteredQuestions.map((question, index) => ({
                    "#": index + 1,
                    question: (
                        <button
                            // href={`${FrontendRoutes.HOMEPAGE}/${subjectID}/question/${question._id}`}
                            className="text-blue-600 cursor-pointer transition duration-300 ease-in-out hover:underline hover:text-blue-800"
                            onClick={(e) => {
                                e.preventDefault();
                                router.push(`${FrontendRoutes.HOMEPAGE}/${subjectID}/question/${question._id}`);
                            }}
                        >
                            {question.question}
                        </button>
                    ),
                    answer: Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.join(", ")
                        : question.correctAnswer
                }))} />

                {/* Create Question Dialog */}
                <Dialog
          open={showModal}
          onOpenChange={(open) => {
            setShowModal(open);
            if (!open) {
            //   resetForm();
              setError(null); // Reset error state when closing modal
            }
          }}
        >
          <DialogContent className="sm:max-w-md md:max-w-lg [&>button:last-child]:hidden">
            <DialogHeader>
              <DialogTitle>Create Question</DialogTitle>
            </DialogHeader>
            <form
            //   onSubmit={handleSubmit}
              className="w-full space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Name Input */}
              <div>
                <label className="mb-1 block text-sm font-semibold">Question</label>
                <input
                  type="text"
                  name="name"
                //   value={formData.name}
                //   onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Biology"
                />
                {error && error.includes('name') && (
                  <p className="text-red-500 text-sm">Question is required.</p>
                )}
              </div>
                
              {/* Subject Dropdown */}
            <div>
                <label className="mb-1 block text-sm font-semibold">Subject</label>
                <select
                  name="subject"
                //   value={formData.subject}
                //   onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects
                    .sort((a, b) => a.year - b.year) // Sort subjects by year
                    .map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name} ({subject.year})
                      </option>
                    ))}
                </select>
                {error && error.includes('subject') && (
                  <p className="text-red-500 text-sm">Subject is required.</p>
                )}
            </div>

            {/* Category Dropdown */}
            <div>
                <label className="mb-1 block text-sm font-semibold">Category</label>
                <select
                  name="category"
                //   value={formData.category}
                //   onChange={handleInputChange}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.category}
                    </option>
                  ))}
                </select>
                {error && error.includes('category') && (
                  <p className="text-red-500 text-sm">Category is required.</p>
                )}
            </div>
                            
                            {/* Question Type (mcq,written) */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Question Type</label>
                                <select
                                    name="type"
                                    // value={formData.type}
                                    // onChange={handleInputChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                >
                                    <option value="" disabled>Select a question type</option>
                                    <option value="mcq">Multiple Choice</option>
                                    <option value="written">Written</option>
                                    <option value="both">Both</option>
                                </select>
                                {error && error.includes('type') && (
                                    <p className="text-red-500 text-sm">Question type is required.</p>
                                )}
                            </div>

                            {/* If Question Type === mcq show choice input and add + button to add more choices like google form */}
                            {/* {(formData.type === 'mcq' && (
                                <div>
                                    <label className="mb-1 block text-sm font-semibold">Choices</label>
                                    <div className="space-y-2">
                                        {formData.choice.map((choice, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    name={`choice-${index}`}
                                                    value={choice}
                                                    onChange={(e) => handleChoiceChange(index, e.target.value)}
                                                    required
                                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                                    placeholder={`Choice ${index + 1}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeChoice(index)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={addChoice}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            + Add Choice
                                        </button>
                                    </div>
                                    {error && error.includes('choice') && (
                                        <p className="text-red-500 text-sm">At least two choices are required.</p>
                                    )}
                                </div>
                            )} */}

                            {/* Correct Answer Input */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold">Correct Answer</label>
                                <input
                                    type="text"
                                    name="correctAnswer"
                                    // value={formData.correctAnswer}
                                    // onChange={handleInputChange}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    placeholder="Enter correct answer"
                                />
                                {error && error.includes('correctAnswer') && (
                                    <p className="text-red-500 text-sm">Correct answer is required.</p>
                                )}
                </div>

              {/* Image Upload (Optional) */}
              {/* <div>
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
                {!formData.image && existingImg && (
                  <div className="mt-2">
                    <Image
                      src={existingImg}
                      alt="Existing Image"
                      width={0}
                      height={0}
                      className="rounded-lg"
                    />
                    <p className="text-sm text-gray-500 mt-2">Current Image</p>
                  </div>
                )}
                {error && error.includes('image') && (
                  <p className="text-red-500 text-sm">Please upload a valid image.</p>
                )}
              </div> */}
              {/* Submit Button */}
              <DialogFooter className="flex justify-between pt-4">
                {/* <Button
                  textButton="Submit"
                  disabled={createMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {createMutation.isPending ? (
                    <>
                      <LoaderIcon className="mr-2 inline animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    "Save Subject"
                  )}
                </Button> */}
      
                {/* Cancel Button */}
                <DialogClose asChild>
                  {/* <Button
                    textButton="Cancel"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                    onClick={resetForm}
                  /> */}
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
            </div>
        </ProtectedPage>
    );
};

export default Question;