"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { BackendRoutes, FrontendRoutes } from '../../config/apiRoutes';
import { Subject } from '../../types/api/Subject';
import { Quiz } from '../../types/api/Quiz';
import { Category } from '../../types/api/Category';
import ProtectedPage from '../../components/ProtectPage';
import Link from 'next/link';
import { IoIosArrowBack } from 'react-icons/io';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoaderIcon } from 'react-hot-toast';
import { Role_type } from '../../config/role';
import AddQuizModal from '../../components/quiz/Modal/AddQuizModal';
import { useUser } from '../../hooks/User/useUser';
import { useDeleteQuiz } from '../../hooks/quiz/useDeleteQuiz';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { BackButton } from '../../components/subjects/Detail/BackButton';

const QuestionPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const subjectFromUrl = searchParams.get('subject');
    
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);

    const [questions, setQuestions] = useState<Quiz[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const { user } = useUser();

    // Search and filter
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(subjectFromUrl);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    
    // Memoize filter options
    const filterOptions = useMemo(() => ({
        searchTerm,
        selectedSubject,
        selectedCategory,
    }), [searchTerm, selectedSubject, selectedCategory]);

    // Check if user is admin or S-admin
    const isAdmin = user?.role === Role_type.ADMIN || user?.role === Role_type.SADMIN;
    const isSAdmin = user?.role === Role_type.SADMIN;

    const deleteQuizMutation = useDeleteQuiz();

    useEffect(() => {
        if (!session){
            toast.error("there is no session");
            return;  
        } 

        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(BackendRoutes.QUIZ, {
                    headers: {
                        Authorization: `Bearer ${session.user.token}`,
                    },
                    params: {
                        subjectID: selectedSubject,
                    },
                });
                // Filter questions based on user role
                const filteredQuestions = isAdmin 
                    ? response.data.data.filter((q: Quiz) => q.status !== "reported")
                    : response.data.data.filter((q: Quiz) => q.status === "approved");
                setQuestions(filteredQuestions);
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

    }, [session, selectedSubject, isAdmin]);

    // Update URL when subject filter changes
    useEffect(() => {
        if (selectedSubject) {
            router.push(`/question?subject=${selectedSubject}`);
        } else {
            router.push('/question');
        }
    }, [selectedSubject, router]);

    // Filter questions
    const filteredQuestions = useMemo(() => {
        if (!questions || questions.length === 0) {
            return [];
        }

        const operators = ['and', 'or', 'not'];
        const searchTerms =
            searchTerm
                .match(/(?:[^\s"“"]+|"[^"]*"|"[^"]*")+/g)
                ?.map(term => term.replace(/["""]/g, '').toLowerCase()) || [];

        const subjectFilter = (q: Quiz) => {
            return !selectedSubject || (q.subject._id === selectedSubject);
        };

        const categoryFilter = (q: Quiz) => {
            return !selectedCategory || (q.category._id === selectedCategory);
        };

        if (!searchTerms.length) {
            return questions.filter(q => subjectFilter(q) && categoryFilter(q));
        }

        return questions.filter(q => {
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
    }, [questions, searchTerm, selectedSubject, selectedCategory]);

    const handleDeleteQuiz = async (quizId: string) => {
        if (!window.confirm('Are you sure you want to delete this question?')) {
            return;
        }

        try {
            await deleteQuizMutation.mutateAsync(quizId);
            toast.success('Question deleted successfully');
            // Refresh the questions list
            const response = await axios.get(BackendRoutes.QUIZ, {
                headers: {
                    Authorization: `Bearer ${session?.user.token}`,
                },
                params: {
                    subjectID: selectedSubject,
                },
            });
            const filteredQuestions = isAdmin 
                ? response.data.data.filter((q: Quiz) => q.status !== "reported")
                : response.data.data.filter((q: Quiz) => q.status === "approved");
            setQuestions(filteredQuestions);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete question');
        }
    };

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

    return (
        <ProtectedPage>
            <div className="container mx-auto p-4 mt-20 justify-center items-center flex flex-col">
                <div className="absolute top-23 md:top-25 left-8 md:left-15 text-lg">
                    <BackButton />
                </div>
                <div className='absolute top-22 md:top-25 right-4 md:right-15'>
                    <button 
                        onClick={() => setShowAddModal(true)} 
                        className="border-1 mb-4 hover:bg-green-600 hover:text-white pl-2 p-3 rounded-sm transition duration-300 ease-in-out hover:opacity-60 cursor-pointer"
                    >
                        + Create
                    </button>
                </div>

                {/* Add Quiz Modal */}
                {user && (
                    <AddQuizModal
                        showModal={showAddModal}
                        setShowModal={setShowAddModal}
                        userProp={user}
                        subject={subjects}
                        category={categories}
                    />
                )}

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
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </section>

                {/* Total count display */}
                <div className="w-full max-w-5xl mb-4 text-right">
                    <p className="text-gray-600">
                        Total Questions: <span className="font-semibold">{filteredQuestions.length}</span>
                    </p>
                </div>

                {/* Question List */}
                <Card className="w-full shadow-xl transition-all duration-300 max-w-5xl">
                    <CardContent className="p-2 sm:p-4 md:p-6">
                        <div className="grid gap-4 grid-cols-1">
                            {filteredQuestions.map((question) => (
                                <div key={question._id} className="relative group">
                                    <Link
                                        href={`/question/${question._id}`}
                                        className="block transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded-lg"
                                    >
                                        <div className={`rounded-lg border ${
                                            question.type === 'choice' 
                                                ? 'border-blue-200 bg-blue-50' 
                                                : question.type === 'written'
                                                ? 'border-purple-200 bg-purple-50'
                                                : question.type === 'both'
                                                ? 'border-blue-400 bg-blue-50'
                                                : ''
                                        } p-3 sm:p-5 shadow-sm transition-all duration-300 hover:shadow-md`}> 
                                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-4">
                                                <div className="space-y-2 w-full md:w-auto">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-semibold text-gray-700 break-words max-w-xs md:max-w-md lg:max-w-lg">
                                                            {question.question}
                                                        </p>
                                                        <Badge
                                                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                                question.type === 'choice'
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : question.type === 'written'
                                                                    ? 'bg-purple-100 text-purple-700'
                                                                    : question.type === 'both'
                                                                    ? 'bg-blue-50 text-blue-700 border border-blue-400 font-bold'
                                                                    : ''
                                                            }`}
                                                        >
                                                            {question.type === 'choice' ? 'MCQ' : question.type === 'written' ? 'Written' : question.type === 'both' ? 'MCQ + Short Answer' : 'Unknown'}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-500 break-words">
                                                        {question.subject.name} - {question.category.category}
                                                    </p>
                                                </div>
                                                {isAdmin && (
                                                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                                                        <Badge
                                                            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
                                                                question.status === "approved"
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                                                : question.status === "pending"
                                                                ? "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                                                                : question.status === "reported"
                                                                ? "bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100"
                                                                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                                                            }`}
                                                        >
                                                            {question.status === "approved" 
                                                                ? "Approved" 
                                                                : question.status === "pending"
                                                                ? "Pending"
                                                                : question.status === "reported"
                                                                ? "Reported"
                                                                : "Rejected"}
                                                        </Badge>
                                                        {isSAdmin && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleDeleteQuiz(question._id);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                                                title="Delete question"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 sm:mt-4 space-y-1 text-xs sm:text-sm text-gray-600">
                                                {question.type === 'choice' ? (
                                                    <>
                                                        <p className="font-medium">Choices:</p>
                                                        {question.choice.map((choice, index) => (
                                                            <p key={index} className="ml-4 break-words">
                                                                {String.fromCharCode(65 + index)}. {choice}
                                                            </p>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="font-medium">Correct Answers:</p>
                                                        {question.correctAnswer.map((answer, index) => (
                                                            <p key={index} className="ml-4 break-words">
                                                                {index + 1}. {answer}
                                                            </p>
                                                        ))}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </ProtectedPage>
    );
}

export default QuestionPage; 