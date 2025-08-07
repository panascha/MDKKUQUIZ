"use client";
import React, { useMemo } from 'react';
import { Bookmark, BookmarkBorder, CheckCircle, Cancel, ErrorOutline } from '@mui/icons-material';
import { Question } from '../../../types/api/Question';
import ImageGallery from '../../magicui/ImageGallery';

interface QuizQuestionDisplayProps {
    currentQuestion: Question;
    currentQuestionIndex: number;
    selectedQuestionTypes: string;
    answerMode: string;
    onToggleBookmark: (index: number) => void;
    onAnswerSelection: (answer: string) => void;
    onShortAnswerChange: (value: string) => void;
    onSubmitCurrentQuestion: () => void;
    onClearAnswer: () => void;
}

const QuizQuestionDisplay: React.FC<QuizQuestionDisplayProps> = ({
    currentQuestion,
    currentQuestionIndex,
    selectedQuestionTypes,
    answerMode,
    onToggleBookmark,
    onAnswerSelection,
    onShortAnswerChange,
    onSubmitCurrentQuestion,
    onClearAnswer
}) => {
    // Shuffled choices memo
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

    if (!currentQuestion) return null;

    return (
        <div className="mb-8 sm:mb-12 flex flex-col md:flex-row justify-center items-start gap-8 w-full">
            {currentQuestion.quiz.img && currentQuestion.quiz.img.length > 0 && (
                <div className="w-[280px] md:w-[250px] aspect-square flex items-center justify-center bg-gray-50 rounded-xl p-4 shadow-inner">
                    <ImageGallery 
                        images={currentQuestion.quiz.img} 
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
                            onToggleBookmark(currentQuestionIndex);
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
                                    ${currentQuestion.select === choice
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}
                                    ${currentQuestion.isSubmitted ? 'cursor-not-allowed opacity-75' : ''}
                                `}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAnswerSelection(choice);
                                }}
                                disabled={currentQuestion.isSubmitted}
                            >
                                {String.fromCharCode(65 + originalIndex)}. {choice}
                            </button>
                        ))}
                    </div>
                ) : selectedQuestionTypes === 'shortanswer' ? (
                    <div className="w-full">
                        <textarea
                            className={`w-full p-4 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300
                                ${currentQuestion.isSubmitted ? 'cursor-not-allowed bg-gray-50' : 'bg-white'}
                            `}
                            rows={3}
                            placeholder="Type your answer here..."
                            value={currentQuestion.select || ''}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => onShortAnswerChange(e.target.value)}
                            readOnly={currentQuestion.isSubmitted}
                        />
                    </div>
                ) : null}
                
                <div className="flex flex-col gap-3 mt-6 w-full">
                    {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && answerMode === 'each-question' && !currentQuestion.isSubmitted && currentQuestion.isAnswered && (
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-1/2"
                                onClick={onSubmitCurrentQuestion}
                            >
                                <CheckCircle className="mr-2" />
                                Submit
                            </button>
                            <button
                                className={`
                                px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 w-1/2
                                ${currentQuestion.isAnswered ? 'opacity-75 cursor-not-allowed' : ''}`}
                                onClick={onClearAnswer}
                            >
                                <Cancel className="mr-2" />
                                Clear Answer
                            </button>
                        </div>
                    )}
                    {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && answerMode === 'end-of-quiz' && currentQuestion.isAnswered && (
                        <div className="flex w-full justify-end gap-3">
                            <button
                                className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                                onClick={onClearAnswer}
                            >
                                <Cancel className="mr-2" />
                                Clear Answer
                            </button>
                        </div>
                    )}
                    
                    {currentQuestion.isSubmitted && (
                        <div className={`px-4 py-3 rounded-lg text-sm sm:text-base flex items-center font-medium
                            ${currentQuestion.isCorrect === true ? 'bg-green-100 text-green-700 border border-green-200'
                                : currentQuestion.isCorrect === false ? 'bg-red-100 text-red-700 border border-red-200'
                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                            {currentQuestion.isCorrect === true ?
                                <><CheckCircle className="mr-2" /> Correct Answer</> :
                                currentQuestion.isCorrect === false ?
                                    <><Cancel className="mr-2" /> Wrong Answer</> :
                                    <><ErrorOutline className="mr-2" /> Answer Submitted</>}
                        </div>
                    )}
                </div>
                
                {currentQuestion.isSubmitted && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
                        <p className="text-sm font-medium">Correct Answer: <span className="text-blue-600 font-semibold">{Array.isArray(currentQuestion.quiz.correctAnswer) ? currentQuestion.quiz.correctAnswer.join(', ') : currentQuestion.quiz.correctAnswer}</span></p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizQuestionDisplay;
