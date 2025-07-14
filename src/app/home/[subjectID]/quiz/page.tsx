'use client'
import { ButtonWithLogo } from "../../../../components/magicui/Buttonwithlogo";
import ProtectedPage from "../../../../components/ProtectPage";
import { FrontendRoutes } from "../../../../config/apiRoutes";
import type { Quiz } from "../../../../types/api/Quiz";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { useGetQuizzes } from "../../../../hooks/quiz/useGetQuizzes";
import { useQuery } from "@tanstack/react-query";
import { useGetSubjectByID } from "../../../../hooks/subject/useGetSubjectByID";
import { useGetCategoryBySubjectID } from "../../../../hooks/category/useGetCategoryBySubjectID";
import { TopicSelection } from "../../../../components/quiz/TopicSelection";
import { QuizTypeSelection } from "../../../../components/quiz/QuizTypeSelection";
import { AnswerModeSelection } from "../../../../components/quiz/AnswerModeSelection";
import { QuestionTypeSelection } from "../../../../components/quiz/QuestionTypeSelection";
import { QuestionCountSelection } from "../../../../components/quiz/QuestionCountSelection";
import { useUser } from '../../../../hooks/useUser';
import { useGetUserStatById } from '../../../../hooks/stats/useGetUserStatById';

export default function Quiz() {
    type QuizType = "chillquiz" | "realtest" | "custom";
    type AnswerModes = "reveal-at-end"| "reveal-after-each"
    const quizTypes: QuizType[] = ["chillquiz", "realtest", "custom"];
    const answerModes: AnswerModes[] = ["reveal-at-end", "reveal-after-each"];
    const questionTypes = ["mcq", "shortanswer"];

    const [quizType, setQuizType] = useState('');
    const [answerMode, setAnswerMode] = useState('');
    const [selectedQuestionTypes, setSelectedQuestionTypes] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [selectCategory, setSelectCategory] = useState<String[]>([]);
    const [maxQuestions, setMaxQuestions] = useState(0);
    const params = useParams();
    const router = useRouter();
    const subjectID = params.subjectID as string;

    const { data: subject, isLoading: isSubjectLoading, error: subjectError } = useQuery({
        queryKey: ["subject", subjectID],
        queryFn: () => useGetSubjectByID(subjectID),
        enabled: !!subjectID
    });

    const { data: categories = [], isLoading: isCategoryLoading, error: categoryError } = useGetCategoryBySubjectID(subjectID);

    const { data: quizzes = [], isLoading: isQuizzesLoading, error: quizzesError } = useGetQuizzes({
        subjectID,
        status: 'approved'
    });

    const filteredQuiz = useMemo(() => {
        if (!selectCategory.length) return [];
        return quizzes.filter((item: Quiz) => selectCategory.includes(item.category._id));
    }, [quizzes, selectCategory]);

    useEffect(() => {
        let max = 0;
        if (selectedQuestionTypes === 'mcq') {
            max = filteredQuiz.filter((q: Quiz) => q.type === 'choice' || q.type === 'both').length;
        } else if (selectedQuestionTypes === 'shortanswer') {
            max = filteredQuiz.filter((q: Quiz) => q.type === 'written' || q.type === 'both').length;
        } else {
            max = filteredQuiz.length;
        }
        setMaxQuestions(max);
    }, [filteredQuiz, selectedQuestionTypes]);

    const defaultValues_AnswerMode = useMemo(() => ({
        chillquiz: answerModes[1],
        realtest: answerModes[0],
        custom: answerModes[0],
    }), [answerModes]);

    const defaultValues_QuestionType = useMemo(() => ({
        chillquiz: 'mcq',
        realtest: 'mcq',
        custom: 'shortanswer',
    }), []);

    const handleStartQuiz = useCallback(() => {
        if (!quizType) {
            alert('Please select a quiz type');
            return;
        }
        if (selectCategory.length === 0) {
            alert('Please select at least one category');
            return;
        }
        if (!answerMode) {
            alert('Please select an answer mode');
            return;
        }
        if (questionCount <= 0) {
            alert('Please select at least one question');
            return;
        }
        if (selectedQuestionTypes.length === 0) {
            alert('Please select a question type');
            return;
        }
        if (questionCount > maxQuestions) {
            alert(`You can only select up to ${maxQuestions} questions`);
            return;
        }

        const queryParams = new URLSearchParams({
            quizType,
            answerMode,
            questionCount: questionCount.toString(),
            questionType: selectedQuestionTypes,
            categories: selectCategory.join(','), 
        }).toString();

        router.push(`${FrontendRoutes.HOMEPAGE}/${subjectID}/quiz/problem?${queryParams}`);
    }, [quizType, selectCategory, answerMode, questionCount, selectedQuestionTypes, maxQuestions, subjectID, router]);

    const { user, loading: userLoading } = useUser();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SADMIN';
    const { data: userStat, isLoading: statLoading } = useGetUserStatById(user?._id || '', subjectID, !!user?._id && !!subjectID);
    const canTakeQuiz = isAdmin || (userStat?.quizCount ?? 0) >= 2;

    if (userLoading || statLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mr-4" />
                <span className="text-lg text-sky-700 animate-fade-in">Checking permissions...</span>
            </div>
        );
    }

    if (!canTakeQuiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <div className="text-3xl font-bold text-gray-700 mb-4">Access Restricted</div>
                <div className="text-lg text-gray-500 mb-6 max-w-md">You must create at least <span className="font-semibold text-blue-600">5 quizzes</span> to access quiz of this subject. Start contributing quizzes to unlock this section!</div>
                <Link href="/home" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Go to Home</Link>
            </div>
        );
    }

    if (isSubjectLoading || isCategoryLoading || isQuizzesLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mr-4" />
                <span className="text-lg text-sky-700 animate-fade-in">Loading...</span>
            </div>
        );          
    }
    
    if (subjectError || categoryError || quizzesError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <span className="text-red-500 text-xl font-semibold mb-2">Error</span>
                <span className="text-gray-600">{subjectError?.message || categoryError?.message || quizzesError?.message}</span>
            </div>
        );          
    }
    
    if (!subject) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <span className="text-red-500 text-xl font-semibold mb-2">Subject not found</span>
            </div>
        );          
    }

    if (!categories.length) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <span className="text-red-500 text-xl font-semibold mb-2">No categories found</span>
            </div>
        );          
    }

    return (
        <ProtectedPage>
            <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-white to-orange-100 flex items-center justify-center py-8 px-2 md:px-0">
                <div className="w-full max-w-5xl p-4 sm:p-8 md:p-12 rounded-3xl mx-auto bg-white/80 shadow-2xl backdrop-blur-md border border-gray-200 animate-fade-in-up transition-all duration-500">
                    <Link href="/home" className="flex items-center gap-2 text-black hover:text-orange-800 transition duration-300 ease-in-out mb-8">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-center w-full drop-shadow-lg tracking-tight animate-slide-down">
                            {subject?.name}
                        </h1>
                    </Link>

                    <div className="space-y-8">
                        <TopicSelection
                            category={categories}
                            selectCategory={selectCategory}
                            setSelectCategory={setSelectCategory}
                            setMaxQuestions={setMaxQuestions}
                            quiz={quizzes}
                            selectedQuestionTypes={selectedQuestionTypes}
                        />

                        <QuizTypeSelection
                            quizTypes={quizTypes}
                            quizType={quizType}
                            setQuizType={setQuizType}
                            setQuestionCount={setQuestionCount}
                            setAnswerMode={setAnswerMode}
                            setSelectedQuestionTypes={setSelectedQuestionTypes}
                            selectCategory={selectCategory}
                            defaultValues_QuestionType={defaultValues_QuestionType}
                            defaultValues_AnswerMode={defaultValues_AnswerMode}
                            answerModes={answerModes}
                            quiz={quizzes}
                            setMaxQuestions={setMaxQuestions}
                        />

                        <AnswerModeSelection
                            answerModes={answerModes}
                            answerMode={answerMode}
                            setAnswerMode={setAnswerMode}
                            selectCategory={selectCategory}
                        />

                        <QuestionTypeSelection
                            questionTypes={questionTypes}
                            selectedQuestionTypes={selectedQuestionTypes}
                            setSelectedQuestionTypes={setSelectedQuestionTypes}
                            selectCategory={selectCategory}
                        />

                        <QuestionCountSelection
                            questionCount={questionCount}
                            setQuestionCount={setQuestionCount}
                            selectCategory={selectCategory}
                            selectedQuestionTypes={selectedQuestionTypes}
                            filteredQuiz={filteredQuiz}
                        />

                        <div className="pt-4">
                            <ButtonWithLogo
                                onClick={handleStartQuiz}
                                className="
                                    w-full
                                    px-8 py-4
                                    text-xl font-bold
                                    text-white text-center
                                    rounded-2xl
                                    bg-gradient-to-r from-cyan-500 to-blue-600
                                    shadow-xl hover:shadow-2xl
                                    transition-all duration-300 ease-in-out
                                    hover:scale-105 hover:brightness-110
                                    focus:outline-none focus:ring-4 focus:ring-orange-300
                                    animate-fade-in
                                "
                                emoji={<span role="img" aria-label="emoji">৻(  •̀ ᗜ •́  ৻)</span>}
                            >
                                🚀 Start Quiz
                            </ButtonWithLogo>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedPage>
    );
}