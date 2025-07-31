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
import { AnswerModeSelection } from "../../../../components/quiz/AnswerModeSelection";
import { QuestionTypeSelection } from "../../../../components/quiz/QuestionTypeSelection";
import { QuestionCountSelection } from "../../../../components/quiz/QuestionCountSelection";
import { useUser } from '../../../../hooks/User/useUser';
import { useGetUserStatById } from '../../../../hooks/stats/useGetUserStatById';
import { Role_type } from "../../../../config/role";
import { BackButton } from "../../../../components/subjects/Detail/BackButton";
import { useQuiz } from '../../../../context/quiz'
import type { AnswerMode, QuestionType } from '../../../../context/quiz'

export default function SetupQuizPage() {

    const answerModes: AnswerMode[] = ['end-of-quiz', 'each-question'] // Keeping this line as it is used later
    const questionTypes: QuestionType[] = ['mcq', 'shortanswer'] // Keeping this line as it is used later

    const { state, dispatch } = useQuiz()
    const { answerMode, questionType: selectedQuestionTypes, categories: selectCategory, questionCount } = state
    const [maxQuestions, setMaxQuestions] = useState(0)

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
        if (!Array.isArray(quizzes)) return [];
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

        const handleStartQuiz = useCallback(() => {
        if (selectCategory.length === 0) {
            alert('Please select at least one topic.');
            return;
        }
        if (!answerMode) {
            alert('Please select an answer mode.');
            return;
        }
        if (!selectedQuestionTypes) {
            alert('Please select a question type.');
            return;
        }
        if (questionCount <= 0) {
            alert('Please select at least one question.');
            return;
        }
        if (questionCount > maxQuestions) {
            alert(`You can only select up to ${maxQuestions} questions for the selected topics and type.`);
            return;
        }
        router.push(`${FrontendRoutes.HOMEPAGE}/${subjectID}/setup-quiz/quiz`);
    }, [selectCategory, answerMode, questionCount, selectedQuestionTypes, maxQuestions, subjectID, router]);

    const { user, loading: userLoading } = useUser();
    const isSAdmin = user?.role === Role_type.SADMIN;
    const isAdmin = user?.role === Role_type.ADMIN || isSAdmin;
    const { data: userStat, isLoading: statLoading } = useGetUserStatById(user?._id || '', subjectID, !!user?._id && !!subjectID);
    const canTakeQuiz = isAdmin || (userStat?.quizCount ?? 0) >= 4;

    if (userLoading || statLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <span className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent mr-4" />
                <span className="text-lg text-sky-700 animate-fade-in">Checking permissions...</span>
            </div>
        );
    }

    if (!isSAdmin && !canTakeQuiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in">
                <div className="text-3xl font-bold text-gray-700 mb-4">Access Restricted</div>
                <div className="text-lg text-gray-500 mb-6 max-w-md">You must create at least <span className="font-semibold text-blue-600">4 quizzes</span> to access quiz of this subject. Start contributing quizzes to unlock this section!</div>
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
                {/* Glassmorphism Back Button Header */}
                <div className="fixed top-20 left-4 z-50">
                    <BackButton />
                </div>
                
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
                            setSelectCategory={(arr: string[]) => dispatch({ type: 'SET_CATEGORIES', payload: arr })}
                            setMaxQuestions={setMaxQuestions}
                            quiz={quizzes}
                            selectedQuestionTypes={selectedQuestionTypes}
                        />

                        <AnswerModeSelection
                            answerModes={answerModes}
                            answerMode={answerMode}
                            setAnswerMode={(v) => dispatch({ type: 'SET_ANSWER_MODE', payload: v })}
                            selectCategory={selectCategory}
                        />
                        <QuestionTypeSelection
                            questionTypes={questionTypes}
                            selectedQuestionTypes={selectedQuestionTypes}
                            setSelectedQuestionTypes={(v) => dispatch({ type: 'SET_QUESTION_TYPE', payload: v as QuestionType })}
                            selectCategory={selectCategory}
                        />

                        <QuestionCountSelection
                            questionCount={questionCount}
                            setQuestionCount={(n) => {
                                const next = typeof n === 'function' ? (n as (prev: number) => number)(questionCount) : n
                                dispatch({ type: 'SET_COUNT', payload: next })
                            }}
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