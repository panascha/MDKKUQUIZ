"use client";
import React, { useCallback, useMemo } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FrontendRoutes } from '@/config/apiRoutes';
import { useSession } from 'next-auth/react';
import { Question } from '@/types/api/Question';
import ProtectedPage from '@/components/ProtectPage';
import { Bookmark, BookmarkBorder, CheckCircle, Cancel, ErrorOutline, ViewList, ViewModule } from '@mui/icons-material';
import { useUser } from '@/hooks/useUser';
import ImageGallery from '@/components/magicui/ImageGallery';
import { useGetQuizzes } from '@/hooks/quiz/useGetQuizzes';
import { useSubmitScore } from '@/hooks/score/useSubmitScore';
import { Quiz } from '@/types/api/Quiz';
import transformUrl from '@/utils/transformUrl';
import { UserScore } from '@/types/api/Score';

export default function Problem() {
    const session = useSession();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useUser();

    const subjectID = params.subjectID as string;
    const answerMode = searchParams.get('answerMode');
    const questionCount = Number(searchParams.get('questionCount'));
    const selectedQuestionTypes = searchParams.get('questionType');
    const selectCategory = useMemo(() => (
        (searchParams.get('categories') || '').split(',').filter(Boolean)
    ), [searchParams]);

    const [seconds, setSeconds] = useState(0);
    const [showQuestion, setShowQuestion] = useState<Question[]>([]);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isQuestionTableOpen, setIsQuestionTableOpen] = useState(false);
    const [questionViewMode, setQuestionViewMode] = useState<'grid' | 'list'>('grid');

    const { data: quizData, isLoading } = useGetQuizzes({
        subjectID,
        status: 'approved',
        transformData: (quizzes) => {
            console.log(quizzes);
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

            return {
                questions: limitedQuestions,
            };
        }
    });

    const { submitScore, calculateScore } = useSubmitScore();

    useEffect(() => {
        if (quizData?.questions) {
            setShowQuestion(quizData.questions);
        }
    }, [quizData]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const currentQuestion = showQuestion[currentQuestionIndex];

    const handleQuestionNavigation = (direction: 'next' | 'previous') => {
        if (direction === 'next') {
            setCurrentQuestionIndex((prevIndex: number) => (prevIndex + 1) % showQuestion.length);
            setCurrentImageIndex(0);
        } else if (direction === 'previous') {
            setCurrentQuestionIndex((prevIndex: number) => (prevIndex - 1 + showQuestion.length) % showQuestion.length);
            setCurrentImageIndex(0);
        }
    };

    const handleSubmit = async () => {
        if (!user._id) {
            alert("No user ID available in session");
            return;
        }

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
            }
        } catch (error) {
            console.error('Error submitting score:', error);
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

    if (!quizData.questions || quizData.questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">No Questions Available</h2>
                    <p className="text-gray-600">There are no questions matching your selected criteria.</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                                {showQuestion[0]?.quiz?.subject?.name || 'Loading...'}
                            </h1>
                    <div className="flex justify-between items-center">
                        <p className="text-base sm:text-lg text-gray-600 mt-2 sm:mt-4 font-medium">
                            Question {currentQuestionIndex + 1} of {showQuestion.length}
                        </p>
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                            Time: {formatTime(seconds)}
                        </div>
                    </div>
                </div>

                        <div className="flex justify-between items-center gap-3 sm:gap-4 mb-8">
                    <button
                                className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionNavigation('previous');
                        }}
                                disabled={currentQuestionIndex === 0}
                    >
                        Previous
                    </button>
                    <button
                                className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionNavigation('next');
                        }}
                                disabled={currentQuestionIndex === showQuestion.length - 1}
                    >
                        Next
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center mb-8 sm:mb-12">
                    {currentQuestion && (
                                <div className="mb-8 sm:mb-12 flex flex-col md:flex-row justify-center items-start gap-8 w-full">
                            {currentQuestion.quiz.img && currentQuestion.quiz.img.length > 0 && (
                                        <div className="w-full md:w-1/2 bg-gray-50 rounded-xl p-4 shadow-inner">
                                            <ImageGallery 
                                                images={currentQuestion.quiz.img.map(img => `http://localhost:5000${img}`)} 
                                            />
                                        </div>
                            )}
                                    <div className={`w-full md:w-1/2 ${currentQuestion.quiz.img && currentQuestion.quiz.img.length > 0 ? 'md:pl-8' : ''} flex flex-col items-center justify-center`}>
                                        <div className="flex justify-between w-full items-center mb-6">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                                        {currentQuestion.quiz.question}
                                    </h2>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleBookmark(currentQuestionIndex);
                                        }}
                                        className="focus:outline-none transform hover:scale-110 transition-transform duration-200"
                                    >
                                        {currentQuestion.isBookmarked ? (
                                            <Bookmark className="text-2xl md:text-3xl text-yellow-500 hover:text-yellow-600 transition duration-200" />
                                        ) : (
                                            <BookmarkBorder className="text-2xl md:text-3xl text-yellow-500 hover:text-yellow-600 transition duration-200" />
                                        )}
                                    </button>
                                </div>
                                {selectedQuestionTypes === 'mcq' ? (
                                    <div className="flex flex-col items-center gap-4 w-full">
                                        {shuffledChoices.map(({ choice, originalIndex }) => (
                                            <button
                                                key={originalIndex}
                                                className={`px-4 sm:px-6 py-3 rounded-lg text-left w-full font-medium transition-all duration-300
                                                    ${showQuestion[currentQuestionIndex].select === choice
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                                                    ${showQuestion[currentQuestionIndex].isSubmitted ? 'cursor-not-allowed opacity-75' : ''}
                                                `}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAnswerSelection(choice);
                                                }}
                                                disabled={showQuestion[currentQuestionIndex].isSubmitted}
                                            >
                                                {String.fromCharCode(65 + originalIndex)}. {choice}
                                            </button>
                                        ))}
                                    </div>
                                ) : selectedQuestionTypes === 'shortanswer' ? (
                                    <div className="w-full">
                                        <textarea
                                            className={`w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300
                                                ${showQuestion[currentQuestionIndex].isSubmitted ? 'cursor-not-allowed bg-gray-50' : 'bg-white'}
                                            `}
                                            rows={3}
                                            placeholder="Type your answer here..."
                                            value={showQuestion[currentQuestionIndex].select || ''}
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => handleShortAnswerChange(e.target.value)}
                                            readOnly={showQuestion[currentQuestionIndex].isSubmitted}
                                        />
                                    </div>
                                ) : null}
                                <div className="flex flex-col gap-3 mt-6 w-full">
                                    {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && answerMode === 'reveal-after-each' && !showQuestion[currentQuestionIndex].isSubmitted && showQuestion[currentQuestionIndex].isAnswered && (
                                        <div className="flex gap-3">
                                            <button
                                                className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-1/2"
                                                onClick={submitCurrentQuestion}
                                            >
                                                <CheckCircle className="mr-2" />
                                                Submit
                                            </button>
                                            <button
                                                className={`
                                                px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-1/2
                                                ${showQuestion[currentQuestionIndex].isAnswered ? 'opacity-75 cursor-not-allowed' : ''}`}
                                                onClick={clearAnswer}
                                            >
                                                <Cancel className="mr-2" />
                                                Clear Answer
                                            </button>
                                        </div>
                                    )}
                                            {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && answerMode === 'reveal-at-end' && showQuestion[currentQuestionIndex].isAnswered && (
                                        <div className="flex w-full justify-end gap-3">
                                            <button
                                                className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                                onClick={clearAnswer}
                                            >
                                                <Cancel className="mr-2" />
                                                Clear Answer
                                            </button>
                                        </div>
                                    )}
                                    
                                    {showQuestion[currentQuestionIndex].isSubmitted && (
                                        <div className={`px-4 py-3 rounded-lg text-sm sm:text-base flex items-center font-medium
                                            ${showQuestion[currentQuestionIndex].isCorrect === true ? 'bg-green-100 text-green-700 border border-green-200'
                                                : showQuestion[currentQuestionIndex].isCorrect === false ? 'bg-red-100 text-red-700 border border-red-200'
                                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                                            {showQuestion[currentQuestionIndex].isCorrect === true ?
                                                <><CheckCircle className="mr-2" /> Correct Answer</> :
                                                showQuestion[currentQuestionIndex].isCorrect === false ?
                                                    <><Cancel className="mr-2" /> Wrong Answer</> :
                                                    <><ErrorOutline className="mr-2" /> Answer Submitted</>}
                                        </div>
                                    )}
                                </div>
                                {showQuestion[currentQuestionIndex].isSubmitted && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
                                        <p className="text-sm font-medium">Correct Answer: <span className="text-blue-600 font-semibold">{currentQuestion.quiz.correctAnswer}</span></p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-4 mt-8">
                    <button
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={() => setIsQuestionTableOpen(true)}
                    >
                        View All Questions
                    </button>
                    {answerMode === 'reveal-at-end' && allQuestionsAnswered && (
                        <button
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            onClick={handleSubmit}
                        >
                            Submit All & Go to Summary
                        </button>
                    )}
                    {answerMode === 'reveal-after-each' && allQuestionsSubmitted && (
                        <button
                            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            onClick={handleSubmit}
                        >
                            Go to Summary
                        </button>
                    )}
                        </div>
                    </div>
                </div>
                </div>
                {isQuestionTableOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-[95%] w-full max-h-[90vh] overflow-auto p-6 sm:p-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">All Questions</h2>
                                <div className="flex gap-3">
                                    <button
                                        onClick={toggleQuestionViewMode}
                                        className="focus:outline-none text-gray-500 hover:text-gray-700 transform hover:scale-110 transition-transform duration-200"
                                        title="Change View"
                                    >
                                        {questionViewMode === 'grid' ? <ViewList className="text-xl" /> : <ViewModule className="text-xl" />}
                                    </button>
                                    <button
                                        onClick={() => setIsQuestionTableOpen(false)}
                                        className="text-gray-500 hover:text-gray-700 focus:outline-none transform hover:scale-110 transition-transform duration-200"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        
                            <div className={`grid ${questionViewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4' : 'flex flex-col gap-3'}`}>
                                {showQuestion.map((q, index) => (
                                    <button
                                        key={index}
                                        className={`p-3 rounded-lg text-sm sm:text-base text-left transition-all duration-300 font-medium border hover:bg-gray-100
                                            ${index === currentQuestionIndex ? 'border-3 border-blue-400' : 'hover:bg-gray-50'}
                                            ${q.isBookmarked ? 'border-2 border-yellow-500' : ''}
                                            ${q.isAnswered ? 'bg-blue-100 border border-blue-200' : ''}
                                            ${q.isSubmitted ?
                                                q.isCorrect === true ? 'bg-green-100 text-green-800 border border-green-300'
                                                    : q.isCorrect === false ? 'bg-red-100 text-red-800 border border-red-300'
                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                : ''}
                                            ${questionViewMode === 'list' ? 'block w-full' : ''}
                                            `}
                                        onClick={() => navigateToQuestion(index)}
                                    >
                                        {index + 1}. {q.quiz.question.substring(0, 25)}{q.quiz.question.length > 25 ? '...' : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {isImageModalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
                        onClick={() => setIsImageModalOpen(false)}>
                        <div
                            className="relative bg-white rounded-xl p-4 sm:p-6 shadow-2xl max-w-[95%] sm:max-w-4xl w-full max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none transform hover:scale-110 transition-transform duration-200">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="rounded-xl overflow-auto w-full h-full flex items-center justify-center relative bg-gray-50">
                                <ImageGallery 
                                    images={currentQuestion.quiz.img.map(img => transformUrl(img))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </ProtectedPage>
    );
}