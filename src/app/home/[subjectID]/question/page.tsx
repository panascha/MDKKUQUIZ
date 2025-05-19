"use client";
import React, { useState } from 'react';
import axios from "axios";
import { useRouter } from 'next/navigation';
import { BackendRoutes, FrontendRoutes } from '@/config/apiRoutes';
import { Quiz } from '@/types/api/Quiz';
import { Subject } from '@/types/api/Subject';
import ProtectedPage from '@/components/ProtectPage';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import Table from '@/components/ui/Table';
import { IoIosArrowBack } from "react-icons/io";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { LoaderIcon } from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { Category } from '@/types/api/Category';

const Question = () => {

    const params = useParams();
    const subjectID = params.subjectID;
    const router = useRouter();

    useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Fetching questions
    const [questions, setQuestions] = useState<Quiz[]>([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(BackendRoutes.QUIZ);
                setQuestions(response.data.data);
                console.log(response.data.data);
                setIsLoading(false);
            }
            catch (err) {
                setError("Failed to fetch questions.");
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, []);

    // Fetch subjects
    const [subjects, setSubjects] = useState<Subject[]>([]);
    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await axios.get(BackendRoutes.SUBJECT);
                setSubjects(response.data.data);
            } catch (err) {
                console.error("Failed to fetch subjects:", err);
            }
        };
        fetchSubjects();
    }, []);

    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(BackendRoutes.CATEGORY);
                setCategories(response.data.data);
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

    
    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(subjectID as string | null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [filteredQuestions, setFilteredQuestions] = useState<Quiz[]>([]);

    useEffect(() => {
        const filterQuestions = () => {
            const operators = ['and', 'or', 'not'];
            const terms = searchTerm
                .match(/(?:[^\s"“”]+|"[^"]*"|“[^”]*”)+/g)
                ?.map(term => term.replace(/["“”]/g, '').toLowerCase()) || [];

            const result = questions.filter((q) => {
                // If no search terms, include all
                if (!terms.length) return (
                    (selectedSubject ? q.subject === selectedSubject : true) &&
                    (selectedCategory ? q.category === selectedCategory : true)
                );

                let includeQuestion = operators.includes(terms[0]) ? false : null;
                let currentOperator = 'or';

                for (let i = 0; i < terms.length; i++) {
                    const term = terms[i];

                    if (operators.includes(term)) {
                        currentOperator = term;
                    } else {
                        const termInQuestion =
                            (q.question && q.question.toLowerCase().includes(term)) ||
                            (Array.isArray(q.choice) && q.choice.join(' ').toLowerCase().includes(term)) ||
                            (Array.isArray(q.correctAnswer) && q.correctAnswer.join(' ').toLowerCase().includes(term));

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
                }

                const matchesSubject = !selectedSubject || (q.subject && q.subject === selectedSubject);
                const matchesCategory = !selectedCategory || (q.category && q.category === selectedCategory);

                return !!includeQuestion && matchesSubject && matchesCategory;
            });

            setFilteredQuestions(result);
        };

        filterQuestions();
    }, [questions, searchTerm, selectedSubject, selectedCategory]);

    

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
                    <button onClick={() => router.push(FrontendRoutes.HOMEPAGE)} className="flex items-center mb-4 hover:bg-orange-400 hover:text-white p-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                        <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                    </button>
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
                                Try Pubmed search e.g. "strongyloides stercoralis" and/or/not "hookworm"
                            </small>
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Search from Name of Keyword, Keyword"
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
                                        : <span className="text-base sm:text-sm">All Topics</span>
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
                <Table headers={["id", "problem", "answer"]} data={filteredQuestions.map((question, index) => ({
                    id: index + 1,
                    problem: (
                        <a
                            href={`${FrontendRoutes.QUESTION}/${question._id}`}
                            className="text-blue-600 hover:underline"
                        >
                            {question.question}
                        </a>
                    ),
                    answer: Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.join(", ")
                        : question.correctAnswer
                }))} />
            </div>
        </ProtectedPage>
    );
};

export default Question;