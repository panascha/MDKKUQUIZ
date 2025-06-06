"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes, FrontendRoutes } from '@/config/apiRoutes';
import { Quiz } from '@/types/api/Quiz';
import { Subject } from '@/types/api/Subject';
import { Keyword } from '@/types/api/Keyword';
import KeywordCard from '@/components/keyword/KeywordCard';
import ProtectedPage from '@/components/ProtectPage';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import Table from '@/components/ui/Table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Category } from '@/types/api/Category';

const KeywordPage = () => {
    const router = useRouter();
    const params = useParams();
    const { subjectID } = params;
    
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // แก้ เปลี่ยนจาก Quiz เป็น Keyword
    const [keywords, setKeywords] = useState<Quiz[]>([]);
    //const [keywords, setKeywords] = useState<Keyword[]>([]);

    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        if (!subjectID) return;
        if (!session) return;

        const fetchKeywords = async () => {
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
                setKeywords(response.data.data);
                console.log("Fetched keywords:", response.data.data);
                setIsLoading(false);
            }
            catch (err) {
                setError("Failed to fetch keywords.");
                setIsLoading(false);
            }
        };
        fetchKeywords();

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

        const useFilteredKeywords = (
            keywords: Keyword[] | null,
            { searchTerm, selectedSubject, selectedCategory }: FilterOptions
        ) => {
            const [filteredKeywords, setFilteredKeywords] = useState<Keyword[]>([]);

            const filterKeywords = useCallback(
                (
                    currentKeywords: Keyword[] | null,
                    currentSearchTerm: string,
                    currentSubject: string | null,
                    currentCategory: string | null
                ) => {
                    if (!currentKeywords || currentKeywords.length === 0) {
                        return [];
                    }
                    const operators = ['and', 'or', 'not'];
                    const searchTerms =
                        currentSearchTerm
                            .match(/(?:[^\s"“”]+|"[^"]*"|“[^”]*”)+/g)
                            ?.map(term => term.replace(/["“”]/g, '').toLowerCase()) || [];
                    const subjectFilter = (q: Keyword) => {
                        console.log(q.subject, currentSubject);
                        return !currentSubject || (q.subject._id === currentSubject);
                    };
                    const categoryFilter = (q: Keyword) => {
                        return !currentCategory || (q.category._id === currentCategory);
                    };
    
                    if (!searchTerms.length) {
                        // console.log("No search terms provided, returning all questions", currentQuestions.filter(q => subjectFilter(q) && categoryFilter(q)));
                        return currentKeywords.filter(q => subjectFilter(q) && categoryFilter(q));
                    }

                    return currentKeywords.filter(q => {
                        let includeQuestion: boolean | null = null;
                        let currentOperator = 'or';
    
                        for (let i = 0; i < searchTerms.length; i++) {
                            const term = searchTerms[i];
    
                            if (operators.includes(term)) {
                                currentOperator = term;
                                continue;
                            }
    
                            const termInQuestion =
                                (q.name && q.name.toLowerCase().includes(term)) ||
                                (Array.isArray(q.keyword) && q.keyword.some(c => c.toLowerCase().includes(term)))
    
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
                setFilteredKeywords(
                    filterKeywords(keywords, searchTerm, selectedSubject, selectedCategory)
                );
            }, [keywords, searchTerm, selectedSubject, selectedCategory, filterKeywords]);

            return filteredKeywords;
        };

        const filteredKeywords = useFilteredKeywords(keywords, {
            searchTerm,
            selectedSubject,
            selectedCategory,
        });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl font-bold mb-4 text-red-500">{error}</h1>
            </div>
        );
    }

    return (
        <ProtectedPage>
            <div className="container mx-auto p-4 mt-20 justify-center items-center flex flex-col">
                <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                    <Link href={`${FrontendRoutes.HOMEPAGE}/${subjectID}`}>
                    <button className="flex items-center mb-4 hover:bg-orange-400 hover:text-white pr-2 py-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                        <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                    </button>
                    </Link>
                </div>
                <div className='absolute top-22 md:top-25 right-4 md:right-15'>
                    <button onClick={() => router.push(FrontendRoutes.QUESTION_CREATE)} className="border-1 mb-4 hover:bg-green-600 hover:text-white pl-2 p-3 rounded-sm transition duration-300 ease-in-out hover:opacity-60 cursor-pointer">
                        + Create
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-center mb-4">Keyword List</h1>

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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </section>
                <KeywordCard keywords={filteredKeywords} />
            </div>
        </ProtectedPage>
    );
}

export default KeywordPage;