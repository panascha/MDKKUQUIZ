"use client";
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes, FrontendRoutes } from '../../config/apiRoutes';
import { Subject } from '../../types/api/Subject';
import { Keyword } from '../../types/api/Keyword';
import ProtectedPage from '../../components/ProtectPage';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Category } from '../../types/api/Category';
import { useGetKeyword } from '../../hooks/keyword/useGetKeyword';
import { useGetQuizzes } from '../../hooks/quiz/useGetQuizzes';
import AddKeywordModal from '../../components/keyword/AddKeywordModal';
import { useUser } from '../../hooks/User/useUser';
import { useDeleteKeyword } from '../../hooks/keyword/useDeleteKeyword';
import { Trash2 } from 'lucide-react';
import { Role_type } from '../../config/role';
import { toast } from 'react-hot-toast';
import { Badge } from '../../components/ui/Badge';
import { useGetCategory } from "../../hooks/category/useGetCategory";

const KeywordPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const subjectFromUrl = searchParams.get('subject');
    
    const { data: session } = useSession();
    const { data: keywords = [], isLoading: keywordsLoading, error: keywordsError } = useGetKeyword();
    const { data: quizzes = [], isLoading: quizzesLoading, error: quizzesError } = useGetQuizzes();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const { user } = useUser();
    const deleteKeywordMutation = useDeleteKeyword();
    
    // Check if user is admin or S-admin
    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;
    const isSAdmin = user?.role === Role_type.SADMIN;

    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(subjectFromUrl);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);


const keywordStatuses = useMemo(() => {
    if (!quizzes?.length) {
        // Return an empty object if there are no quizzes to avoid errors.
        return {};
    }

    const quizKeywordMap = new Map<string, 'isuse' | 'pending'>();
    
    // This is the corrected part
    const uniqueQuizzes: typeof quizzes = Array.from(
        quizzes.reduce((map: Map<string, typeof quizzes[0]>, quiz: typeof quizzes[0]) => map.set(quiz._id, quiz), new Map()).values()
    );
    
    for (const quiz of uniqueQuizzes) {
        const status = quiz.status;
        if (status === 'approved') {
            for (const kw of quiz.correctAnswer) {
                quizKeywordMap.set(kw, 'isuse');
            }
        } else if (status === 'pending') {
            for (const kw of quiz.correctAnswer) {
                if (!quizKeywordMap.has(kw)) {
                    quizKeywordMap.set(kw, 'pending');
                }
            }
        }
    }

    const statuses: { [keyword: string]: 'isuse' | 'pending' | 'notuse' } = {};
    // Ensure keywords is an array before using flatMap
    const allPossibleKeywords = new Set(keywords?.flatMap((group: Keyword) => group.keywords ?? []) ?? []);

    for (const keywordString of allPossibleKeywords) {
        statuses[keywordString as string] = quizKeywordMap.get(keywordString as string) || 'notuse';
    }
    
    return statuses;

}, [quizzes, keywords]);
    
    // Memoize filter options
    const filterOptions = useMemo(() => ({
        searchTerm,
        selectedSubject,
        selectedCategory,
    }), [searchTerm, selectedSubject, selectedCategory]);

    // Filter keywords
    const filteredKeywords = useMemo(() => {
        if (!keywords || keywords.length === 0) {
            return [];
        }

        // First filter by user role
        let roleFilteredKeywords = keywords;
        if (!isAdmin && !isSAdmin) {
            roleFilteredKeywords = keywords.filter((k: Keyword) => k.status === "approved");
        }
        else if (isAdmin && !isSAdmin) {
            roleFilteredKeywords = keywords.filter((k: Keyword) => k.status !== "reported");
        }

        const latestKeywords = Object.values(
            roleFilteredKeywords.reduce((acc: { [key: string]: Keyword }, keyword: Keyword) => {
            if (!acc[keyword.name] || new Date(keyword.updatedAt) > new Date(acc[keyword.name].updatedAt)) {
                acc[keyword.name] = keyword;
            }
            return acc;
            }, {})
        );

        const operators = ['and', 'or', 'not'];
        const searchTerms =
            searchTerm
                .match(/(?:[^\s"“"]+|"[^"]*"|"[^"]*")+/g)
                ?.map(term => term.replace(/["""]/g, '').toLowerCase()) || [];

        const subjectFilter = (k: Keyword) => {
            return !selectedSubject || (k.subject._id === selectedSubject);
        };

        const categoryFilter = (k: Keyword) => {
            return !selectedCategory || (k.category._id === selectedCategory);
        };

        if (!searchTerms.length) {
            return (latestKeywords as Keyword[]).filter((k: Keyword) => subjectFilter(k) && categoryFilter(k));
        }

        return (latestKeywords as Keyword[]).filter((k: Keyword) => {
            let includeKeyword: boolean | null = null;
            let currentOperator = 'or';

            for (let i = 0; i < searchTerms.length; i++) {
                const term = searchTerms[i];

                if (operators.includes(term)) {
                    currentOperator = term;
                    continue;
                }

                const termInKeyword =
                    (k.name && k.name.toLowerCase().includes(term)) ||
                    (Array.isArray(k.keywords) && k.keywords.some((c: string) => c.toLowerCase().includes(term)));

                if (includeKeyword === null) {
                    includeKeyword = termInKeyword;
                } else if (currentOperator === 'and') {
                    includeKeyword = includeKeyword && termInKeyword;
                } else if (currentOperator === 'or') {
                    includeKeyword = includeKeyword || termInKeyword;
                } else if (currentOperator === 'not') {
                    includeKeyword = includeKeyword && !termInKeyword;
                }
            }
            return !!includeKeyword && subjectFilter(k) && categoryFilter(k);
        });
    }, [keywords, searchTerm, selectedSubject, selectedCategory, isAdmin, isSAdmin]);


    useEffect(() => {
        if (!session) return;

        const fetchData = async () => {
            try {
                const response = await axios.get(BackendRoutes.SUBJECT, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                });
                setSubjects(response.data.data);
                setIsLoading(false);
            } catch (err) {
                setError(`Failed to fetch data : ${err}`);
                setIsLoading(false);
            }
        };
        fetchData();
    }, [session]);

    const { data: categoriesData, isLoading: isCategoriesLoading, error: categoriesError } = useGetCategory();

    useEffect(() => {
        if (categoriesData) {
            setCategories(categoriesData);
        }
        if (categoriesError) {
            setError(`Failed to fetch categories: ${categoriesError}`);
        }
    }, [categoriesData, categoriesError]);

    // Update URL when subject filter changes
    useEffect(() => {
    const currentSubjectInUrl = searchParams.get('subject');

    if (selectedSubject && selectedSubject !== currentSubjectInUrl) {
        router.push(`/keyword?subject=${selectedSubject}`);
    } else if (!selectedSubject && currentSubjectInUrl) {
        router.push('/keyword');
    }

    // By having these conditions, if the state and URL are already in sync,
    // router.push() is NEVER called, and the infinite loop is broken.

}, [selectedSubject, searchParams, router]); // Keep dependencies

    const handleDeleteKeyword = async (keywordId: string) => {
        if (!window.confirm('Are you sure you want to delete this keyword?')) {
            return;
        }

        try {
            await deleteKeywordMutation.mutateAsync(keywordId);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete keyword');
        }
    };

    if (keywordsLoading || isLoading || isCategoriesLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            </div>
        );
    }

    if (keywordsError || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-2xl font-bold mb-4 text-red-500">
                    {keywordsError?.toString() || error?.toString() || 'An error occurred'}
                </h1>
            </div>
        );
    }

    return (
        <ProtectedPage>
            <div className="container mx-auto p-4 mt-20 justify-center items-center flex flex-col">
                <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                    <Link href={FrontendRoutes.HOMEPAGE}>
                        <button className="flex items-center mb-4 hover:bg-orange-400 hover:text-white pr-2 py-2 rounded-sm transition duration-300 ease-in-out hover:opacity-80 cursor-pointer">
                            <span className='flex items-center'> <IoIosArrowBack className="text-xl" /> Back</span>
                        </button>
                    </Link>
                </div>
                <div className='absolute top-22 md:top-25 right-4 md:right-15'>
                    <button 
                        onClick={() => setShowAddModal(true)} 
                        className="border-1 mb-4 hover:bg-green-600 hover:text-white pl-2 p-3 rounded-sm transition duration-300 ease-in-out hover:opacity-60 cursor-pointer"
                    >
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
                                Try Pubmed search e.g. &quot"strongyloides" and/or/not "hookworm"
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

                {/* Total count display */}
                <div className="w-full max-w-5xl mb-4 text-right">
                    <p className="text-gray-600">
                        Total Keywords: <span className="font-semibold">{filteredKeywords.length}</span>
                    </p>
                </div>

                <div className="grid gap-6 w-full max-w-5xl">
                    {filteredKeywords.map((keyword: Keyword) => (
                        <div key={keyword._id} className="relative group">
                            <Link href={`/keyword/${keyword._id}`} className="block">
                                <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-gray-700">
                                                {keyword.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {keyword.subject.name}
                                            </p>
                                        </div>
                                        {(isAdmin &&
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                                                        keyword.status === "approved"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                                        : keyword.status === "pending"
                                                        ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                                        : keyword.status === "reported"
                                                        ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                                                        : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                                    }`}
                                                >
                                                    {keyword.status === "approved" 
                                                        ? "Approved" 
                                                        : keyword.status === "pending"
                                                        ? "Pending"
                                                        : keyword.status === "reported"
                                                        ? "Reported"
                                                        : "Rejected"}
                                                </Badge>
                                                {isSAdmin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            handleDeleteKeyword(keyword._id);
                                                        }}
                                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                        title="Delete keyword"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 space-y-1 text-sm text-gray-600">
                                        <p className="font-medium">Keywords:</p>
                                        <div className="flex flex-wrap gap-2">
                                                                                        {
                                                keyword.keywords.map((kw: string, index: number) => {
                                                const status = keywordStatuses[kw];
                                                const statusStyles = {
                                                    isuse: 'bg-green-200 text-green-800',
                                                    pending: 'bg-yellow-200 text-yellow-800',
                                                    notuse: 'bg-red-200 text-red-800',
                                                };
                                                const style = statusStyles[status as keyof typeof statusStyles] ?? 'bg-gray-100 text-gray-800';
                                                
                                                return (
                                                    <span key={index} className={`px-2 py-1 rounded-md ${style}`}>
                                                        {kw}
                                                    </span>
                                                );
                                            })}

                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
                <AddKeywordModal 
                    showModal={showAddModal}
                    setShowModal={setShowAddModal}
                    userProp={user}
                    subject={subjects}
                    category={categories}
                />
            </div>
        </ProtectedPage>
    );
}

export default KeywordPage; 