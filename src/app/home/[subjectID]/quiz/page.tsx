'use client'
import { ButtonWithLogo } from "../../../../components/magicui/Buttonwithlogo";
import ProtectedPage from "../../../../components/ProtectPage";
import { FrontendRoutes } from "../../../../config/apiRoutes";
import type { Quiz } from "../../../../types/api/Quiz";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { LoaderIcon } from "react-hot-toast";
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
    const questionTypes = ["mcq", "shortanswer", "both"];

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

    // Default Values
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
    const canTakeQuiz = isAdmin || (userStat?.quizCount ?? 0) >= 5;

    if (userLoading || statLoading) {
        return (
            <div className="flex items-center justify-center gap-3 pt-20">
                <LoaderIcon /> Checking permissions...
            </div>
        );
    }

    if (!canTakeQuiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-3xl font-bold text-gray-700 mb-4">Access Restricted</div>
                <div className="text-lg text-gray-500 mb-6 max-w-md">You must create at least <span className="font-semibold text-blue-600">5 quizzes</span> to access quiz of this subject. Start contributing quizzes to unlock this section!</div>
                <Link href="/home" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Go to Home</Link>
            </div>
        );
    }

    if (isSubjectLoading || isCategoryLoading || isQuizzesLoading) {
        return (
            <div className="flex items-center justify-center gap-3 pt-20">
                <LoaderIcon /> Loading...
            </div>
        );          
    }
    
    if (subjectError || categoryError || quizzesError) {
        return (
            <div className="text-red-500 flex items-center gap-2 pt-20">
                <span>Error:</span> {subjectError?.message || categoryError?.message || quizzesError?.message}
            </div>
        );          
    }
    
    if (!subject) {
        return (
            <div className="text-red-500 pt-20">Subject not found</div>
        );          
    }

    if (!categories.length) {
        return (
            <div className="text-red-500 pt-20">No categories found</div>
        );          
    }

    return (
        <ProtectedPage>
            <div className="container max-w-5xl p-8 md:p-16 rounded-lg mt-6 mx-auto bg-white shadow-lg animate-fade-in">
                <Link href="/subjects" className="flex items-center gap-2 text-black hover:text-orange-800 transition duration-300 ease-in-out mb-6">
                    <h1 className="text-4xl font-bold text-center animate-slide-down">
                        Quiz for {subject?.name}
                    </h1>
                </Link>

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

                <ButtonWithLogo
                    onClick={handleStartQuiz}
                    className="
                        w-full
                        px-6 py-3
                        text-lg font-semibold
                        text-white text-center
                        rounded-2xl
                        bg-gradient-to-r from-cyan-500 to-blue-600
                        shadow-lg hover:shadow-xl
                        transition-all duration-300 ease-in-out
                        hover:scale-102 hover:brightness-110
                        focus:outline-none focus:ring-2 focus:ring-orange-400
                        animate-fade-in
                    "
                    emoji={<span role="img" aria-label="emoji">৻(  •̀ ᗜ •́  ৻)</span>}
                >
                    🚀 Start Quiz
                </ButtonWithLogo>
            </div>
        </ProtectedPage>
    );
}