"use client";
import React, { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from "next/navigation";
import { Question } from '../../../../../types/api/Question';
import ProtectedPage from '../../../../../components/ProtectPage';
import { useUser } from '../../../../../hooks/User/useUser';
import { useGetQuizzes } from '../../../../../hooks/quiz/useGetQuizzes';
import { useSubmitScore } from '../../../../../hooks/score/useSubmitScore';
import { Quiz } from '../../../../../types/api/Quiz';
import { useGetUserStatById } from '../../../../../hooks/stats/useGetUserStatById';
import { Role_type } from '../../../../../config/role';
import { useQuiz } from '../../../../../context/quiz';
import { FrontendRoutes } from '../../../../../config/apiRoutes';
import { useQuizSessionStorage } from '../../../../../hooks/quiz/useQuizSessionStorage';

import QuizHeader from '../../../../../components/quiz/quizQuestion/QuizHeader';
import QuizNavigation from '../../../../../components/quiz/quizQuestion/QuizNavigation';
import QuizQuestionDisplay from '../../../../../components/quiz/quizQuestion/QuizQuestionDisplay';
import QuizActions from '../../../../../components/quiz/quizQuestion/QuizActions';
import QuizQuestionTable from '../../../../../components/quiz/quizQuestion/QuizQuestionTable';


export default function Problem() {
    const router = useRouter();
    const params = useParams();
    const { state } = useQuiz()
    const { answerMode, questionType: selectedQuestionTypes, categories: selectCategory, questionCount } = state

    const { user, loading: userLoading } = useUser();
    const isSAdmin = user?.role === Role_type.SADMIN;
    const isAdmin = user?.role === Role_type.ADMIN || isSAdmin;
    const subjectID = params.subjectID as string;
    
    // Initialize session storage hook
    const { saveAnswersToSession, loadAnswersFromSession, clearQuizSession, getSessionKey } = useQuizSessionStorage({
        subjectID,
        selectCategory,
        selectedQuestionTypes,
        questionCount
    });

    useEffect(() => {
        if (!selectCategory.length || questionCount <= 0 || !answerMode || !selectedQuestionTypes) {
            router.replace(`${FrontendRoutes.HOMEPAGE}/${subjectID}/setup-quiz`)
        }
    }, [selectCategory, questionCount, answerMode, selectedQuestionTypes, router, subjectID]);
    
    const { data: userStat, isLoading: statLoading } = useGetUserStatById(user?._id || '', subjectID, !!user?._id && !!subjectID);
    const canTakeQuiz = isAdmin || (userStat?.quizCount ?? 0) >= 4;

    const [seconds, setSeconds] = useState(0);
    const [showQuestion, setShowQuestion] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isQuestionTableOpen, setIsQuestionTableOpen] = useState(false);
    const [questionViewMode, setQuestionViewMode] = useState<'grid' | 'list'>('grid');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTimerVisible, setIsTimerVisible] = useState(true);

    const { data: quizData, isLoading } = useGetQuizzes({
        subjectID,
        status: 'approved',
        transformData: (quizzes) => {
            const mapToQuestion = (data: Quiz[]): Question[] => {
                return data.map((item) => ({
                    quiz: item,
                    select: null,
                    isBookmarked: false,
                    isAnswered: false,
                    isSubmitted: false,
                    isCorrect: null,
                }));
            };

            const shuffleArray = <T,>(array: T[]): T[] => {
                const newArray = [...array];
                for (let i = newArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
                }
                return newArray;
            };

            // Create a unique key for this quiz session
            const sessionKey = getSessionKey();
            
            // Try to get cached questions from sessionStorage
            const cachedQuestions = typeof window !== 'undefined' ? sessionStorage.getItem(sessionKey) : null;
            
            if (cachedQuestions) {
                try {
                    const parsedQuestions = JSON.parse(cachedQuestions);
                    // Validate that cached questions are still valid
                    if (parsedQuestions.length === questionCount) {
                        return {
                            questions: parsedQuestions,
                        };
                    }
                } catch (error) {
                    console.error('Error parsing cached questions:', error);
                }
            }

            // If no valid cached questions, generate new ones
            const allQuestions = mapToQuestion(quizzes);

            const filteredQuestions = allQuestions.filter((q) => {
                const categoryMatch = selectCategory.includes(q.quiz.category._id);
                const typeMatch = selectedQuestionTypes === 'mcq'
                    ? (q.quiz.type === 'choice' || q.quiz.type === 'both')
                    : (q.quiz.type === 'written' || q.quiz.type === 'both');
                return categoryMatch && typeMatch;
            });

            const shuffledQuestions = shuffleArray(filteredQuestions);
            const limitedQuestions = shuffledQuestions.slice(0, questionCount);

            // Save to sessionStorage
            if (typeof window !== 'undefined') {
                try {
                    sessionStorage.setItem(sessionKey, JSON.stringify(limitedQuestions));
                } catch (error) {
                    console.error('Error saving questions to sessionStorage:', error);
                }
            }

            return {
                questions: limitedQuestions,
            };
        }
    });

    const { submitScore, calculateScore } = useSubmitScore();

    useEffect(() => {
        if (quizData?.questions) {
            const questionsWithAnswers = loadAnswersFromSession(quizData.questions);
            setShowQuestion(questionsWithAnswers);
        }
    }, [quizData, loadAnswersFromSession]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const currentQuestion = showQuestion[currentQuestionIndex];

    const handleQuestionNavigation = (direction: 'next' | 'previous') => {
        if (direction === 'next') {
            setCurrentQuestionIndex((prevIndex: number) => (prevIndex + 1) % showQuestion.length);
        } else if (direction === 'previous') {
            setCurrentQuestionIndex((prevIndex: number) => (prevIndex - 1 + showQuestion.length) % showQuestion.length);
        }
    };

    const handleSubmit = async () => {
        if (!user._id) {
            alert("No user ID available in session");
            return;
        }
        setIsSubmitting(true);
        
        // Clear the session storage for this quiz when submitting
        clearQuizSession();
        
        // Mark all questions as correct or incorrect
        const updatedQuestions = showQuestion.map(question => {
            let isCorrect = false;
            if (selectedQuestionTypes === 'mcq') {
                const userAnswer = question.select || '';
                const correctAnswers = question.quiz.correctAnswer || [];
                isCorrect = userAnswer !== '' && correctAnswers.includes(userAnswer);
            } else if (selectedQuestionTypes === 'shortanswer') {
                const userAnswer = question.select || '';
                const correctAnswers = question.quiz.correctAnswer || [];
                isCorrect = correctAnswers.some(correctAnswer => 
                    userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
                );
            }
            return {
                ...question,
                isCorrect,
                isBookmarked: question.isBookmarked || false,
                isSubmitted: true
            };
        });

        setShowQuestion(updatedQuestions);

        const totalScore = calculateScore(updatedQuestions, selectedQuestionTypes || '');

        const scoreData = {
            user: user._id,
            Subject: subjectID,
            Category: selectCategory,
            Score: totalScore,
            FullScore: showQuestion.length,
            Question: updatedQuestions.map(q => ({
                Quiz: q.quiz._id,
                Answer: q.select || '',
                isCorrect: q.isCorrect || false,
                isBookmarked: q.isBookmarked || false
            })),
            timeTaken: seconds
        };

        try {
            const result = await submitScore(scoreData);
            if (result?._id) {
                router.push(`/profile/${result._id}`);
            } else {
                console.error('No score ID returned from submission');
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('Error submitting score:', error);
            setIsSubmitting(false);
        }
    };

    const clearAnswer = () => {
        if (!showQuestion[currentQuestionIndex].isSubmitted) {
            const updatedQuestions = [...showQuestion];
            updatedQuestions[currentQuestionIndex].select = null;
            updatedQuestions[currentQuestionIndex].isAnswered = false;
            updatedQuestions[currentQuestionIndex].isCorrect = null;
            setShowQuestion(updatedQuestions);
            saveAnswersToSession(updatedQuestions);
        }
    };

    const toggleBookmark = (index: number) => {
        const updatedQuestions = [...showQuestion];
        updatedQuestions[index].isBookmarked = !updatedQuestions[index].isBookmarked;
        setShowQuestion(updatedQuestions);
        saveAnswersToSession(updatedQuestions);
    };

    const handleAnswerSelection = (answer: string) => {
        if (!showQuestion[currentQuestionIndex].isSubmitted) {
            const updatedQuestions = [...showQuestion];
            updatedQuestions[currentQuestionIndex].select = answer;
            updatedQuestions[currentQuestionIndex].isAnswered = true;
            setShowQuestion(updatedQuestions);
            saveAnswersToSession(updatedQuestions);
        }
    };

    const handleShortAnswerChange = (value: string) => {
        if (!showQuestion[currentQuestionIndex].isSubmitted) {
            const updatedQuestions = [...showQuestion];
            updatedQuestions[currentQuestionIndex].select = value;
            updatedQuestions[currentQuestionIndex].isAnswered = value !== '';
            setShowQuestion(updatedQuestions);
            saveAnswersToSession(updatedQuestions);
        }
    };

    const submitCurrentQuestion = () => {
        const updatedQuestions = [...showQuestion];
        const currentQuestion = updatedQuestions[currentQuestionIndex];

        let isCorrect = false;
        if (selectedQuestionTypes === 'mcq') {
            const userAnswer = currentQuestion.select || '';
            const correctAnswers = currentQuestion.quiz.correctAnswer || [];
            isCorrect = userAnswer !== '' && correctAnswers.includes(userAnswer);
        } else if (selectedQuestionTypes === 'shortanswer') {
            const userAnswer = currentQuestion.select || '';
            const correctAnswers = currentQuestion.quiz.correctAnswer || [];
            isCorrect = correctAnswers.some(correctAnswer => 
                userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
            );
        }

        currentQuestion.isCorrect = isCorrect;
        currentQuestion.isSubmitted = true;
        setShowQuestion(updatedQuestions);
        saveAnswersToSession(updatedQuestions);
    };

    const navigateToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setIsQuestionTableOpen(false);
    };

    const toggleQuestionViewMode = () => {
        setQuestionViewMode(prevMode => (prevMode === 'grid' ? 'list' : 'grid'));
    };

    const allQuestionsAnswered = useMemo(() => 
        Array.isArray(showQuestion) && showQuestion.length > 0 && showQuestion.every(q => q.isAnswered)
    , [showQuestion]);

    const allQuestionsSubmitted = useMemo(() => 
        Array.isArray(showQuestion) && showQuestion.length > 0 && showQuestion.every(q => q.isSubmitted)
    , [showQuestion]);

    // Add shuffled choices memo
    const shuffledChoices = useMemo(() => {
        if (!currentQuestion || selectedQuestionTypes !== 'mcq') return [];
        
        // Create a copy of choices with their indices
        const choicesWithIndices = currentQuestion.quiz.choice.map((choice, index) => ({
            choice,
            originalIndex: index
        }));
        
        // Shuffle the choices
        return [...choicesWithIndices].sort(() => Math.random() - 0.5);
    }, [currentQuestion, selectedQuestionTypes]);

    if (userLoading || statLoading) {
        return (
            <div className="flex items-center justify-center gap-3 pt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" /> Checking permissions...
            </div>
        );
    }

    if (!isSAdmin && !canTakeQuiz) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="text-3xl font-bold text-gray-700 mb-4">Access Restricted</div>
                <div className="text-lg text-gray-500 mb-6 max-w-md">You must create at least <span className="font-semibold text-blue-600">4 quizzes</span> to access the quiz of this subject. Start contributing quizzes to unlock this section!</div>
                <button onClick={() => router.push('/home')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Go to Home</button>
            </div>
        );
    }

    if (isLoading || !quizData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading questions...</p>
                </div>
            </div>
        );
    }

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                        <QuizHeader
                            subjectName={showQuestion[0]?.quiz?.subject?.name}
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={showQuestion.length}
                            isTimerVisible={isTimerVisible}
                            seconds={seconds}
                            onToggleTimer={() => setIsTimerVisible(v => !v)}
                        />

                        <QuizNavigation
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={showQuestion.length}
                            onPrevious={() => handleQuestionNavigation('previous')}
                            onNext={() => handleQuestionNavigation('next')}
                        />

                        <div className="flex flex-col items-center justify-center mb-8 sm:mb-12">
                            {currentQuestion && (
                                <QuizQuestionDisplay
                                    currentQuestion={currentQuestion}
                                    currentQuestionIndex={currentQuestionIndex}
                                    selectedQuestionTypes={selectedQuestionTypes}
                                    answerMode={answerMode}
                                    onToggleBookmark={toggleBookmark}
                                    onAnswerSelection={handleAnswerSelection}
                                    onShortAnswerChange={handleShortAnswerChange}
                                    onSubmitCurrentQuestion={submitCurrentQuestion}
                                    onClearAnswer={clearAnswer}
                                />
                            )}
                        </div>

                        <QuizActions
                            answerMode={answerMode}
                            allQuestionsAnswered={allQuestionsAnswered}
                            allQuestionsSubmitted={allQuestionsSubmitted}
                            isSubmitting={isSubmitting}
                            onViewAllQuestions={() => setIsQuestionTableOpen(true)}
                            onSubmitQuiz={handleSubmit}
                        />
                    </div>
                </div>
            </div>
            
            <QuizQuestionTable
                isOpen={isQuestionTableOpen}
                questions={showQuestion}
                currentQuestionIndex={currentQuestionIndex}
                questionViewMode={questionViewMode}
                onClose={() => setIsQuestionTableOpen(false)}
                onToggleViewMode={toggleQuestionViewMode}
                onNavigateToQuestion={navigateToQuestion}
            />
        </ProtectedPage>
    );
}