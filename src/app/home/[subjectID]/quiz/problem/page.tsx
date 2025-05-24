"use client";
import React, { useCallback, useMemo } from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BackendRoutes } from '@/config/apiRoutes';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Question } from '@/types/api/Question';
import ProtectedPage from '@/components/ProtectPage';
import { Bookmark, BookmarkBorder, CheckCircle, Cancel, ErrorOutline, ViewList, ViewModule } from '@mui/icons-material';

export default function Problem(){
    const session = useSession();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const subjectID = params.subjectID;

    const quizType = searchParams.get('quizType');
    const answerMode = searchParams.get('answerMode');
    const questionCount = Number(searchParams.get('questionCount'));
    const selectedQuestionTypes = searchParams.get('questionType');
    const selectCategory = useMemo(() => (
    (searchParams.get('categories') || '').split(',').filter(Boolean)
    ), [searchParams]);

    const [question, setQuestion] = useState<Question[]>([]);
    const [showQuestion, setShowQuestion] = useState<Question[]>([])
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [zoomLevel] = useState(1);
    const [isQuestionTableOpen, setIsQuestionTableOpen] = useState(false);
    const [questionViewMode, setQuestionViewMode] = useState<'grid' | 'list'>('grid');

    const allQuestionsAnswered = question.every(q => q.isAnswered);
    const allQuestionsSubmitted = question.every(q => q.isSubmitted);

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!subjectID) return;
            try {
                const response = await axios.get(
                    BackendRoutes.QUIZ_FILTER.replace(":subjectID", String(subjectID)),
                    {
                        headers: {  
                            Authorization: `Bearer ${session?.data?.user.token}`,
                        },
                    }
                );
                const mapToQuestion = (data: any[]): Question[] => {
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

    useEffect(() => {
        if (question.length === 0) return;

        const filtered = question.filter((item) =>
            selectCategory.includes(item.quiz.category)
        );

        console.log("Questions:", question.slice(0, 3));
        console.log("Category IDs from questions:", question.map(q => q.quiz.category));
        console.log("selectCategory:", selectCategory);
        console.log("filtered", filtered);
        const selected = getRandomQuestion(filtered, questionCount);
        setShowQuestion(selected);
    }, [question, questionCount, selectCategory]);
    
    const currentQuestion = question[currentQuestionIndex];

      // const handleQuestionNavigation = (direction: 'next' | 'previous') => {
    //     if (direction === 'next') {
    //         setCurrentQuestionIndex((prevIndex: number) => (prevIndex + 1) % questions.length);
    //         setCurrentImageIndex(0);
    //     } else if (direction === 'previous') {
    //         setCurrentQuestionIndex((prevIndex: number) => (prevIndex - 1 + questions.length) % questions.length);
    //         setCurrentImageIndex(0);
    //     }
    // };

    // const toggleBookmark = (index: number) => {
    //     setQuestions(prevQuestions =>
    //         prevQuestions.map((question, i) =>
    //             i === index ? { ...question, isBookmarked: !question.isBookmarked } : question
    //         )
    //     );
    // };

    // const clearAnswer = () => {
    //     if (!questions[currentQuestionIndex].isSubmitted) {
    //         const updatedQuestions = [...questions];
    //         updatedQuestions[currentQuestionIndex].select = null;
    //         updatedQuestions[currentQuestionIndex].isAnswered = false;
    //         updatedQuestions[currentQuestionIndex].isCorrect = null;
    //         setQuestions(updatedQuestions);
    //     }
    // };

    // const handleAnswerSelection = (answer: string) => {
    //     if (!questions[currentQuestionIndex].isSubmitted) {
    //         const updatedQuestions = [...questions];
    //         updatedQuestions[currentQuestionIndex].select = answer;
    //         updatedQuestions[currentQuestionIndex].isAnswered = true;
    //         setQuestions(updatedQuestions);
    //     }
    // };

    // const handleShortAnswerChange = (value: string) => {
    //     if (!questions[currentQuestionIndex].isSubmitted) {
    //         const updatedQuestions = [...questions];
    //         updatedQuestions[currentQuestionIndex].select = value;
    //         updatedQuestions[currentQuestionIndex].isAnswered = value !== '';
    //         setQuestions(updatedQuestions);
    //     }
    // };

    // const submitCurrentQuestion = () => {
    //     const updatedQuestions = [...questions];
    //     const currentQuestion = updatedQuestions[currentQuestionIndex];

    //     let isCorrect = false;
    //     if (selectedQuestionTypes === 'mcq') {
    //         isCorrect = currentQuestion.select === currentQuestion.answer;
    //     } else if (selectedQuestionTypes === 'shortanswer') {
    //         isCorrect = currentQuestion.select?.toLowerCase().trim() === currentQuestion.answer?.toLowerCase().trim();
    //     }

    //     currentQuestion.isCorrect = isCorrect;
    //     currentQuestion.isSubmitted = true;
    //     setQuestions(updatedQuestions);
    // };

    // const navigateToQuestion = (index: number) => {
    //     setCurrentQuestionIndex(index);
    //     setIsQuestionTableOpen(false);
    // };

    // const toggleQuestionViewMode = () => {
    //     setQuestionViewMode(prevMode => (prevMode === 'grid' ? 'list' : 'grid'));
    // };

    // const goToSummary = () => {
    // const currentQuestion = questions[currentQuestionIndex];
    // };
    return(
        <ProtectedPage>
            <div className="container p-4 sm:p-8 mt-10 sm:border-2 sm:border-gray-300 rounded-lg shadow-md bg-white mx-auto"
                onClick={() => isImageModalOpen && setIsImageModalOpen(false)}>
                <div className="text-center mb-4">
                    <h1 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6">{question[0].quiz.subject.name}</h1>
                    <p className="text-base sm:text-lg text-gray-600 mt-2 sm:mt-4">
                        Question {currentQuestionIndex + 1} of {question.length}
                    </p>
                </div>
                <div className="flex justify-between items-center gap-2 sm:gap-4 mt-4 mb-6">
                    <button
                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-sm sm:text-base"
                        onClick={(e) => {
                            e.stopPropagation();
                            //handleQuestionNavigation('previous');
                        }}
                    >
                        Previous
                    </button>
                    <button
                        className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-sm:text-base"
                        onClick={(e) => {
                            e.stopPropagation();
                            //handleQuestionNavigation('next');
                        }}
                    >
                        Next
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center mb-6 sm:mb-10">
                    {currentQuestion && (
                        <div className="mb-6 sm:mb-10 flex flex-col md:flex-row justify-center items-center gap-4 w-full">
                            {currentQuestion.quiz.img && currentQuestion.quiz.img.length > 0 && (
                                <div className="mb-4 md:mb-0 md:w-1/2 flex flex-col items-center justify-center relative">
                                    <button
                                        className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-400 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + currentQuestion.quiz.img.length) % currentQuestion.quiz.img.length);
                                        }}
                                    >
                                        &#8249;
                                    </button>
                                    <div
                                        className="w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsImageModalOpen(true);
                                        }}
                                    >
                                        <div className="w-full flex items-center justify-center h-full">
                                            <img
                                                //src={transformUrl(currentQuestion.img[currentImageIndex])}
                                                alt={`Question ${currentImageIndex + 1}`}
                                                className="object-contain max-w-full max-h-full transition-transform duration-300 ease-in-out"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-400 z-10"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % currentQuestion.quiz.img.length);
                                        }}
                                    >
                                        &#8250;
                                    </button>
                                    <div className="text-sm text-gray-500 text-center mt-2">
                                        {currentImageIndex + 1} / {currentQuestion.quiz.img.length}
                                    </div>
                                </div>
                            )}
                            <div className={`md:w-1/2 ${currentQuestion.quiz.img && currentQuestion.quiz.img.length > 0 ? 'md:pl-6' : ''} flex flex-col items-center justify-center`}>
                                <div className="flex justify-between w-full items-center mb-2">
                                    <h2 className="text-lg sm:text-xl font-semibold text-center">
                                        {currentQuestion.quiz.question}
                                    </h2>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            //toggleBookmark(currentQuestionIndex);
                                        }}
                                        className="focus:outline-none"
                                    >
                                        {/* {question[currentQuestionIndex].isBookmarked ? (
                                            <Bookmark className="text-xl md:text-2xl sm:text-2xl text-yellow-500 hover:text-yellow-600 transition duration-200" />
                                        ) : (
                                            <BookmarkBorder className="text-xl md:text-2xl sm:text-2xl text-yellow-500 hover:text-yellow-600 transition duration-200" />
                                        )} */}
                                    </button>
                                </div>
                                {selectedQuestionTypes === 'mcq' ? (
                                    <div className="flex flex-col items-center gap-2 sm:gap-4 w-full">
                                        {currentQuestion.quiz.choice.map((choice: string, index: number) => (
                                            <button
                                                key={index}
                                                className={`px-3 sm:px-4 py-2 rounded-lg transition duration-300 text-left w-full
                                                    ${question[currentQuestionIndex].select === choice
                                                        ? 'bg-primary text-white'
                                                        : 'bg-gray-200 hover:bg-gray-300'}
                                                    ${question[currentQuestionIndex].isSubmitted ? 'cursor-not-allowed' : ''}
                                                `}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    //handleAnswerSelection(choice);
                                                }}
                                                disabled={question[currentQuestionIndex].isSubmitted}
                                            >
                                                {String.fromCharCode(65 + index)}. {choice}
                                            </button>
                                        ))}
                                    </div>
                                ) : selectedQuestionTypes === 'shortanswer' ? (
                                    <div className="w-full">
                                        <textarea
                                            className={`w-full p-3 sm:p-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500
                                                ${question[currentQuestionIndex].isSubmitted ? 'cursor-not-allowed bg-gray-100' : ''}
                                            `}
                                            rows={2}
                                            placeholder="Type your answer here..."
                                            value={question[currentQuestionIndex].select || ''}
                                            onClick={(e) => e.stopPropagation()}
                                            //onChange={(e) => handleShortAnswerChange(e.target.value)}
                                            readOnly={question[currentQuestionIndex].isSubmitted}
                                        />
                                    </div>
                                ) : null}
                                <div className="flex flex-col gap-2 mt-4 w-full">
                                    {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && answerMode === 'one-by-one' && !question[currentQuestionIndex].isSubmitted && (
                                        <div className="flex gap-2">
                                            <button
                                                className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 text-sm sm:text-base w-1/2"
                                                //onClick={submitCurrentQuestion}
                                            >
                                                <CheckCircle className="mr-2" />
                                                Submit
                                            </button>
                                            <button
                                                className="px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 text-sm sm:text-base w-1/2"
                                                //onClick={clearAnswer}
                                            >
                                                <Cancel className="mr-2" />
                                                Clear Answer
                                            </button>
                                        </div>
                                    )}
                                    {question[currentQuestionIndex].isSubmitted && (
                                        <div className={`px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base flex items-center
                                            ${question[currentQuestionIndex].isCorrect === true ? 'bg-green-200 text-green-700'
                                                : question[currentQuestionIndex].isCorrect === false ? 'bg-red-200 text-red-700'
                                                    : 'bg-yellow-200 text-yellow-700'}`}>
                                            {question[currentQuestionIndex].isCorrect === true ?
                                                <><CheckCircle className="mr-2" /> Correct Answer</> :
                                                question[currentQuestionIndex].isCorrect === false ?
                                                    <><Cancel className="mr-2" /> Wrong Answer</> :
                                                    <><ErrorOutline className="mr-2" /> Answer Submitted</>}
                                        </div>
                                    )}
                                </div>
                                {question[currentQuestionIndex].isSubmitted && (
                                    <div className="mt-2 p-2 bg-gray-100 rounded-md">
                                        <p className="text-sm font-medium">Correct Answer: <span className="text-blue-600">{currentQuestion.quiz.correctAnswer}</span></p>
                                        {/* {currentQuestion.explanation && (
                                            <p className="text-sm">Explanation: <span className="text-gray-700">{currentQuestion.explanation}</span></p>
                                        )} */}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-300 text-sm sm:text-base"
                        onClick={() => setIsQuestionTableOpen(true)}
                    >
                        View All Questions
                    </button>
                    {answerMode === 'all-at-once' && allQuestionsAnswered && (
                        <button
                            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 text-sm sm:text-base"
                            //onClick={goToSummary}
                        >
                            Submit All & Go to Summary
                        </button>
                    )}
                    {answerMode === 'one-by-one' && allQuestionsSubmitted && (
                        <button
                            className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 text-sm sm:text-base"
                            //onClick={goToSummary}
                        >
                            Go to Summary
                        </button>
                    )}
                </div>
                {isQuestionTableOpen && (
                    <div className="relative bg-white rounded-lg shadow-lg max-w-[95%] w-full max-h-[90vh] overflow-auto p-4 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">All Questions</h2>
                            <div className="flex gap-2">
                                <button
                                    //onClick={toggleQuestionViewMode}
                                    className="focus:outline-none text-gray-500 hover:text-gray-700"
                                    title="Change View"
                                >
                                    {questionViewMode === 'grid' ? <ViewList className="text-lg" /> : <ViewModule className="text-lg" />}
                                </button>
                                <button
                                    onClick={() => setIsQuestionTableOpen(false)}
                                    className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    
                        <div className={`grid ${questionViewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3' : 'flex flex-col gap-2'}`}>
                            
                            {question.map((q, index) => (
                                <button
                                    key={index}
                                    className={`p-2 rounded-md text-sm sm:text-base text-left transition duration-200
                                        ${index === currentQuestionIndex ? 'bg-blue-100 font-semibold' : 'hover:bg-gray-100'}
                                        ${q.isBookmarked ? 'border-2 border-yellow-500' : ''}
                                        ${q.isAnswered ? 'bg-green-100' : ''}
                                        ${q.isSubmitted ?
                                            q.isCorrect === true ? 'bg-green-200 text-green-700'
                                                : q.isCorrect === false ? 'bg-red-200 text-red-700'
                                                    : 'bg-yellow-200 text-yellow-700'
                                            : ''}
                                        ${questionViewMode === 'list' ? 'block w-full' : ''}
                                        `}
                                    //onClick={() => navigateToQuestion(index)}
                                >
                                    {/* {index + 1}. {q.problem.substring(0, 50)}{q.problem.length > 50 ? '...' : ''} */}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {isImageModalOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                        onClick={() => setIsImageModalOpen(false)}>
                        <div
                            className="relative bg-white rounded-lg p-4 sm:p-6 shadow-lg max-w-[95%] sm:max-w-4xl w-full max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}>
                            <button
                                onClick={() => setIsImageModalOpen(false)}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none">
                                <svg className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex flex-col items-center justify-center h-full w-full">
                                <div className="rounded-lg overflow-auto w-full h-full flex items-center justify-center relative">
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