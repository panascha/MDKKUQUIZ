"use client";
import React, { useCallback, useMemo } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BackendRoutes, FrontendRoutes } from '@/config/apiRoutes';
import { useSession } from 'next-auth/react';
import axios, { AxiosError } from 'axios';
import { Question } from '@/types/api/Question';
import ProtectedPage from '@/components/ProtectPage';
import { Bookmark, BookmarkBorder, CheckCircle, Cancel, ErrorOutline, ViewList, ViewModule, Category } from '@mui/icons-material';
import { Quiz } from '@/types/api/Quiz';
import { Subject } from '@/types/api/Subject';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import ImageGallery from '@/components/magicui/ImageGallery';

export default function Problem(){
    const session = useSession();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const { user } = useUser();

    const subjectID = params.subjectID;

    const answerMode = searchParams.get('answerMode');
    const questionCount = Number(searchParams.get('questionCount'));
    const selectedQuestionTypes = searchParams.get('questionType');
    const selectCategory = useMemo(() => (
    (searchParams.get('categories') || '').split(',').filter(Boolean)
    ), [searchParams]);

    const [seconds, setSeconds] = useState(0);
    const [scoreID, setScoreID] = useState("");
    const [question, setQuestion] = useState<Question[]>([]);
    const [subject, setSubject] = useState<Subject>();
    const [showQuestion, setShowQuestion] = useState<Question[]>([])
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomLevel] = useState(1);
    const [isQuestionTableOpen, setIsQuestionTableOpen] = useState(false);
    const [questionViewMode, setQuestionViewMode] = useState<'grid' | 'list'>('grid');

    const allQuestionsAnswered = showQuestion.every(q => q.isAnswered);
    const allQuestionsSubmitted = showQuestion.every(q => q.isSubmitted);

    const scoreMutation = useMutation({
        mutationFn: async (scoreData: {
            user: string;
            Subject: string;
            Category: string[];
            Score: number;
            FullScore: number;
            Question: Array<{
                Quiz: string;
                Answer: string;
                isCorrect: boolean;
            }>;
            timeTaken: number;
        }) => {
            if (!session?.data?.user.token) throw new Error("Authentication required");
            
            const response = await axios.post(BackendRoutes.SCORE, scoreData, {
                headers: {
                    Authorization: `Bearer ${session?.data?.user.token}`,
                    "Content-Type": "application/json",
                },
            });
            setScoreID(response.data.data._id)
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["scores"] });
        },
        onError: (error: AxiosError<{ message: string }>) => {
            console.error("Failed to submit score:", error);
            alert(`Failed to submit score: ${error.response?.data?.message || error.message}`);
        },
    });

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!subjectID) return;
            try {
                const response = await axios.get(
                    BackendRoutes.QUIZ_FILTER.replace(":subjectID", String(subjectID)),
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.data?.user.token}`,
                        },
                    }
                );
                const subject = await axios.get(
                    `${BackendRoutes.SUBJECT}/${subjectID}`,
                    {
                        headers: {  
                            Authorization: `Bearer ${session?.data?.user.token}`,
                        },
                    }
                );
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
                setQuestion(mapToQuestion(response.data.data));
                setSubject(subject.data.data);
                console.log(response.data.data);
            } catch (error) {
                console.error("Error fetching question:", error);
            }
        };
        fetchQuestion();

    }, [subjectID, session?.data?.user.token]);


    const getRandomQuestion = useCallback((array: Question[], count: number) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }, []);

    // Initial randomization when component mounts
    useEffect(() => {
        if (question.length === 0) return;

        const filtered = question.filter((item) =>
            selectCategory.includes(item.quiz.category._id)
        );

        const selected = getRandomQuestion(filtered, questionCount);
        setShowQuestion(selected);
    }, []); // Empty dependency array means this runs only once on mount

    // Update questions when dependencies change without randomizing
    useEffect(() => {
        if (question.length === 0) return;

        const filtered = question.filter((item) =>
            selectCategory.includes(item.quiz.category._id)
        );

        setShowQuestion(filtered.slice(0, questionCount));
    }, [question, questionCount, selectCategory]);

    useEffect(() => {
        const interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
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
    
    const submitScore = (totalScore: number) => {
        // Get user ID from session
        const userId = user._id;

        if (!userId) {
            alert("No user ID available in session");
            return;
        }

        const scoreData = {
            user: userId,
            Subject: String(subjectID),
            Category: selectCategory,
            Score: totalScore,
            FullScore: showQuestion.length,
            Question: showQuestion.map(q => ({
                Quiz: q.quiz._id,
                Answer: q.select || '',
                isCorrect: q.isCorrect || false
            })),
            timeTaken: seconds
        };

        try {
            scoreMutation.mutate(scoreData);
        } catch (error) {
            alert("An unexpected error occurred while submitting the score");
        }
    };

    const handleSubmit = () => {
        if (answerMode === "reveal-at-end"){
            const updatedQuestions = [...showQuestion];
            let totalScore = 0;

            updatedQuestions.forEach((question) => {
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
                
                question.isCorrect = isCorrect;
                question.isSubmitted = true;
                if (isCorrect) totalScore++;
            });

            setShowQuestion(updatedQuestions);
            submitScore(totalScore);
        }
        else {
            const checkAnswer = showQuestion.filter((q) => q.isCorrect);
            const totalScore = checkAnswer.length;
            submitScore(totalScore);
        }
        router.push(`/home/${subjectID}/quiz/${scoreID}`);
    }

    // const toggleBookmark = (index: number) => {
    //     setQuestions(prevQuestions =>
    //         prevQuestions.map((question, i) =>
    //             i === index ? { ...question, isBookmarked: !question.isBookmarked } : question
    //         )
    //     );
    // };

    const clearAnswer = () => {
        if (!showQuestion[currentQuestionIndex].isSubmitted) {
            const updatedQuestions = [...showQuestion];
            updatedQuestions[currentQuestionIndex].select = null;
            updatedQuestions[currentQuestionIndex].isAnswered = false;
            updatedQuestions[currentQuestionIndex].isCorrect = null;
            setShowQuestion(updatedQuestions);
        }
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
        setQuestion(updatedQuestions);
    };

    const navigateToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        setIsQuestionTableOpen(false);
    };

    const toggleQuestionViewMode = () => {
        setQuestionViewMode(prevMode => (prevMode === 'grid' ? 'list' : 'grid'));
    };

    return(
        <ProtectedPage>
            <div className="container mt-20 p-4 sm:p-8 sm:border-2 sm:border-gray-300 rounded-xl shadow-lg bg-white mx-auto max-w-7xl"
                onClick={() => isImageModalOpen && setIsImageModalOpen(false)}>
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">{subject?.name}</h1>
                    <div className="flex justify-between items-center">
                        <p className="text-base sm:text-lg text-gray-600 mt-2 sm:mt-4 font-medium">
                            Question {currentQuestionIndex + 1} of {showQuestion.length}
                        </p>
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                            Time: {formatTime(seconds)}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center gap-3 sm:gap-4 mt-6 mb-8">
                    <button
                        className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionNavigation('previous');
                        }}
                    >
                        Previous
                    </button>
                    <button
                        className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionNavigation('next');
                        }}
                    >
                        Next
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center mb-8 sm:mb-12">
                    {currentQuestion && (
                        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row justify-center items-center gap-6 w-full">
                            {currentQuestion.quiz.img && currentQuestion.quiz.img.length > 0 && (
                                // <div className="mb-6 md:mb-0 md:w-1/2 flex flex-col items-center justify-center relative">
                                //     <button
                                //         className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 px-3 py-2 rounded-full hover:bg-gray-100 z-10 shadow-md transition-all duration-300 hover:shadow-lg"
                                //         onClick={(e) => {
                                //             e.stopPropagation();
                                //             setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentQuestion.quiz.img.length) % currentQuestion.quiz.img.length);
                                //         }}
                                //     >
                                //         &#8249;
                                //     </button>
                                //     <div
                                //         className="w-full h-72 sm:h-80 md:h-96 rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
                                //         onClick={(e) => {
                                //             e.stopPropagation();
                                //             setIsImageModalOpen(true);
                                //         }}
                                //     >
                                //         <div className="w-full flex items-center justify-center h-full bg-gray-50">
                                //             <img
                                //                 //src={transformUrl(currentQuestion.img[currentImageIndex])}
                                //                 alt={`Question ${currentImageIndex + 1}`}
                                //                 className="object-contain max-w-full max-h-full transition-transform duration-300 ease-in-out"
                                //             />
                                //         </div>
                                //     </div>
                                //     <button
                                //         className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white text-gray-700 px-3 py-2 rounded-full hover:bg-gray-100 z-10 shadow-md transition-all duration-300 hover:shadow-lg"
                                //         onClick={(e) => {
                                //             e.stopPropagation();
                                //             setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentQuestion.quiz.img.length);
                                //         }}
                                //     >
                                //         &#8250;
                                //     </button>
                                //     <div className="text-sm text-gray-500 text-center mt-3 font-medium">
                                //         {currentImageIndex + 1} / {currentQuestion.quiz.img.length}
                                //     </div>
                                // </div>
                                
                                <ImageGallery images={currentQuestion.quiz.img} />
                            )}
                            <div className={`w-full md:w-1/2 ${currentQuestion.quiz.img && currentQuestion.quiz.img.length > 0 ? 'md:pl-8' : ''} flex flex-col items-center justify-center px-6`}>
                                <div className="flex justify-between w-full items-center mb-4">
                                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                                        {currentQuestion.quiz.question}
                                    </h2>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            //toggleBookmark(currentQuestionIndex);
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
                                        {currentQuestion.quiz.choice.map((choice: string, index: number) => (
                                            <button
                                                key={index}
                                                className={`px-4 sm:px-6 py-3 rounded-lg text-left w-full font-medium
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
                                                {String.fromCharCode(65 + index)}. {choice}
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
                                                                        {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && answerMode === 'reveal-at-end' &&  showQuestion[currentQuestionIndex].isAnswered && (
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
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                                        className={`p-3 rounded-lg text-sm sm:text-base text-left transition-all duration-300 font-medium
                                            ${index === currentQuestionIndex ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'hover:bg-gray-50'}
                                            ${q.isBookmarked ? 'border-2 border-yellow-400 bg-yellow-50' : ''}
                                            ${q.isAnswered ? 'bg-green-50 border border-green-200' : ''}
                                            ${q.isSubmitted ?
                                                q.isCorrect === true ? 'bg-green-100 text-green-800 border border-green-300'
                                                    : q.isCorrect === false ? 'bg-red-100 text-red-800 border border-red-300'
                                                        : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                : ''}
                                            ${questionViewMode === 'list' ? 'block w-full' : ''}
                                            `}
                                        onClick={() => navigateToQuestion(index)}
                                    >
                                        {/* {index + 1}. {q.problem.substring(0, 50)}{q.problem.length > 50 ? '...' : ''} */}
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
                                    <img
                                        //src={transformUrl(currentQuestion.img[currentImageIndex])}
                                        alt={`Question ${currentImageIndex + 1}`}
                                        className="object-contain transition-transform duration-300 ease-in-out w-full h-full"
                                        style={{ transform: `scale(${zoomLevel})`, margin: 'auto' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedPage>
    );
};