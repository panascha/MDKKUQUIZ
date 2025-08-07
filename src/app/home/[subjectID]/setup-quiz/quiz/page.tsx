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
import { useQuiz } from '../../../../../context/quiz'
import { FrontendRoutes } from '../../../../../config/apiRoutes'
import { useShuffledChoices } from '../../../../../hooks/quiz/useShuffledChoices';
import { useQuizSessionStorage } from '../../../../../hooks/quiz/useQuizSessionStorage';
import { useQuizKeyboardNavigation } from '../../../../../hooks/quiz/useQuizKeyboardNavigation';
import QuizHeader from '../../../../../components/quiz/quizQuestion/QuizHeader';
import QuizNavigation from '../../../../../components/quiz/quizQuestion/QuizNavigation';
import QuizQuestion from '../../../../../components/quiz/quizQuestion/QuizQuestion';
import QuizActions from '../../../../../components/quiz/quizQuestion/QuizActions';
import CorrectAnswerDisplay from '../../../../../components/quiz/quizQuestion/CorrectAnswerDisplay';
import QuizSubmitButtons from '../../../../../components/quiz/quizQuestion/QuizSubmitButtons';
import QuizQuestionTable from '../../../../../components/quiz/quizQuestion/QuizQuestionTable';
import QuizImageModal from '../../../../../components/quiz/quizQuestion/QuizImageModal';
import KeyboardShortcutsHelp from '../../../../../components/quiz/KeyboardShortcutsHelp';


export default function Problem() {
    const router = useRouter();
    const params = useParams();
    const { state } = useQuiz()
    const { answerMode, questionType: selectedQuestionTypes, categories: selectCategory, questionCount } = state

    const { user, loading: userLoading } = useUser();
    const isSAdmin = user?.role === Role_type.SADMIN;
    const isAdmin = user?.role === Role_type.ADMIN || isSAdmin;
    const subjectID = params.subjectID as string;
    
    useEffect(() => {
        if (!selectCategory.length || questionCount <= 0 || !answerMode || !selectedQuestionTypes) {
            router.replace(`${FrontendRoutes.HOMEPAGE}/${subjectID}/setup-quiz`)
        }
    }, [selectCategory, questionCount, answerMode, selectedQuestionTypes, router, subjectID]);
    
    const { data: userStat, isLoading: statLoading } = useGetUserStatById(user?._id || '', subjectID, !!user?._id && !!subjectID);
    const canTakeQuiz = isAdmin || (userStat?.quizCount ?? 0) >= 4;

    const [seconds, setSeconds] = useState(0);
    const [showQuestion, setShowQuestion] = useState<Question[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isQuestionTableOpen, setIsQuestionTableOpen] = useState(false);
    const [questionViewMode, setQuestionViewMode] = useState<'grid' | 'list'>('grid');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTimerVisible, setIsTimerVisible] = useState(true);

    // Use custom hooks
    const { clearQuizSessionStorage } = useQuizSessionStorage({
        subjectID,
        selectedQuestionTypes: selectedQuestionTypes || '',
        questionCount,
        selectCategory
    });

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

            // Create a unique session key based on quiz parameters
            const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
            
            // Check if shuffled questions exist in session storage
            const cachedQuestions = sessionStorage.getItem(sessionKey);
            if (cachedQuestions) {
                try {
                    const parsedQuestions = JSON.parse(cachedQuestions);
                    // Validate that the cached questions are still valid
                    const validQuestions = parsedQuestions.filter((q: Question) => 
                        quizzes.some(quiz => quiz._id === q.quiz._id)
                    );
                    
                    if (validQuestions.length === parsedQuestions.length) {
                        return {
                            questions: validQuestions,
                        };
                    }
                } catch (error) {
                    console.warn('Failed to parse cached questions:', error);
                }
            }

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

            // Save shuffled questions to session storage
            try {
                sessionStorage.setItem(sessionKey, JSON.stringify(limitedQuestions));
            } catch (error) {
                console.warn('Failed to save questions to session storage:', error);
            }

            return {
                questions: limitedQuestions,
            };
        }
    });

    const { submitScore, calculateScore } = useSubmitScore();

    const currentQuestion = showQuestion[currentQuestionIndex];
    
    const shuffledChoices = useShuffledChoices({
        currentQuestion,
        selectedQuestionTypes: selectedQuestionTypes || '',
        subjectID,
        questionCount,
        selectCategory
    });

    useEffect(() => {
        if (quizData?.questions) {
            // Check if we have saved progress in session storage
            const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
            const savedProgress = sessionStorage.getItem(`${sessionKey}_progress`);
            
            if (savedProgress) {
                try {
                    const parsedProgress = JSON.parse(savedProgress);
                    // Merge saved answers with fresh questions
                    const questionsWithProgress = quizData.questions.map((question, index) => {
                        const savedQuestion = parsedProgress[index];
                        if (savedQuestion && savedQuestion.quiz._id === question.quiz._id) {
                            return {
                                ...question,
                                select: savedQuestion.select,
                                isBookmarked: savedQuestion.isBookmarked,
                                isAnswered: savedQuestion.isAnswered,
                                isSubmitted: savedQuestion.isSubmitted,
                                isCorrect: savedQuestion.isCorrect
                            };
                        }
                        return question;
                    });
                    setShowQuestion(questionsWithProgress);
                } catch (error) {
                    console.warn('Failed to parse saved progress:', error);
                    setShowQuestion(quizData.questions);
                }
            } else {
                setShowQuestion(quizData.questions);
            }
        }
    }, [quizData, subjectID, selectedQuestionTypes, questionCount, selectCategory]);

    useEffect(() => {
        if (showQuestion.length > 0) {
            const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
            
            const timeoutId = setTimeout(() => {
                try {
                    sessionStorage.setItem(`${sessionKey}_progress`, JSON.stringify(showQuestion));
                } catch (error) {
                    console.warn('Failed to save progress to session storage:', error);
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [showQuestion, subjectID, selectedQuestionTypes, questionCount, selectCategory]);

    useEffect(() => {
        const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
        
        const saveProgress = () => {
            if (showQuestion.length > 0) {
                try {
                    sessionStorage.setItem(`${sessionKey}_progress`, JSON.stringify(showQuestion));
                } catch (error) {
                    console.warn('Failed to save progress to session storage:', error);
                }
            }
        };

        return () => {
            saveProgress();
        };
    }, [showQuestion, subjectID, selectedQuestionTypes, questionCount, selectCategory]);

    // Save progress when navigating between questions
    useEffect(() => {
        if (showQuestion.length > 0) {
            const sessionKey = `quiz_${subjectID}_${selectedQuestionTypes}_${questionCount}_${selectCategory.sort().join('_')}`;
            try {
                sessionStorage.setItem(`${sessionKey}_progress`, JSON.stringify(showQuestion));
            } catch (error) {
                console.warn('Failed to save progress to session storage:', error);
            }
        }
    }, [currentQuestionIndex]); // Only save when question index changes

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

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
                clearQuizSessionStorage();
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
        }
    };

    const toggleBookmark = (index: number) => {
        const updatedQuestions = [...showQuestion];
        updatedQuestions[index].isBookmarked = !updatedQuestions[index].isBookmarked;
        setShowQuestion(updatedQuestions);
    };

    const handleAnswerSelection = (answer: string) => {
        if (!showQuestion[currentQuestionIndex].isSubmitted) {
            const updatedQuestions = [...showQuestion];
            updatedQuestions[currentQuestionIndex].select = answer;
            updatedQuestions[currentQuestionIndex].isAnswered = true;
            setShowQuestion(updatedQuestions);
        }
    };

    const handleShortAnswerChange = (value: string) => {
        if (!showQuestion[currentQuestionIndex].isSubmitted) {
            const updatedQuestions = [...showQuestion];
            updatedQuestions[currentQuestionIndex].select = value;
            updatedQuestions[currentQuestionIndex].isAnswered = value !== '';
            setShowQuestion(updatedQuestions);
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

    // Add keyboard navigation
    useQuizKeyboardNavigation({
        currentQuestion,
        currentQuestionIndex,
        totalQuestions: showQuestion.length,
        selectedQuestionTypes: selectedQuestionTypes || '',
        shuffledChoices,
        onNavigateQuestion: handleQuestionNavigation,
        onAnswerSelection: handleAnswerSelection,
        isSubmitted: currentQuestion?.isSubmitted || false
    });

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
                            subjectName={showQuestion[0]?.quiz?.subject?.name || ''}
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={showQuestion.length}
                            seconds={seconds}
                            isTimerVisible={isTimerVisible}
                            onToggleTimer={() => setIsTimerVisible((v) => !v)}
                        />

                        <QuizNavigation
                            currentQuestionIndex={currentQuestionIndex}
                            totalQuestions={showQuestion.length}
                            onNavigate={handleQuestionNavigation}
                        />

                        <div className="flex flex-col items-center justify-center mb-8 sm:mb-12">
                            {currentQuestion && (
                                <>
                                    <QuizQuestion
                                        currentQuestion={currentQuestion}
                                        currentQuestionIndex={currentQuestionIndex}
                                        selectedQuestionTypes={selectedQuestionTypes || ''}
                                        shuffledChoices={shuffledChoices}
                                        onBookmarkToggle={toggleBookmark}
                                        onAnswerSelection={handleAnswerSelection}
                                        onShortAnswerChange={handleShortAnswerChange}
                                    />
                                    
                                    <QuizActions
                                        currentQuestion={currentQuestion}
                                        selectedQuestionTypes={selectedQuestionTypes || ''}
                                        answerMode={answerMode || ''}
                                        onSubmitCurrentQuestion={submitCurrentQuestion}
                                        onClearAnswer={clearAnswer}
                                    />
                                    
                                    <CorrectAnswerDisplay currentQuestion={currentQuestion} />
                                </>
                            )}
                        </div>

                        <QuizSubmitButtons
                            answerMode={answerMode || ''}
                            allQuestionsAnswered={allQuestionsAnswered}
                            allQuestionsSubmitted={allQuestionsSubmitted}
                            isSubmitting={isSubmitting}
                            onSubmit={handleSubmit}
                            onViewAllQuestions={() => setIsQuestionTableOpen(true)}
                        />
                    </div>
                </div>
            </div>
            
            <QuizQuestionTable
                isOpen={isQuestionTableOpen}
                showQuestion={showQuestion}
                currentQuestionIndex={currentQuestionIndex}
                questionViewMode={questionViewMode}
                onClose={() => setIsQuestionTableOpen(false)}
                onToggleViewMode={toggleQuestionViewMode}
                onNavigateToQuestion={navigateToQuestion}
            />
            
            <QuizImageModal
                isOpen={isImageModalOpen}
                currentQuestion={currentQuestion}
                onClose={() => setIsImageModalOpen(false)}
            />
            
            <KeyboardShortcutsHelp />
        </ProtectedPage>
    );
}