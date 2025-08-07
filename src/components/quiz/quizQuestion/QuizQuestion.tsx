"use client";
import React from 'react';
import { Question } from '../../../types/api/Question';
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import ImageGallery from '../../magicui/ImageGallery';

interface QuizQuestionProps {
    currentQuestion: Question;
    currentQuestionIndex: number;
    selectedQuestionTypes: string;
    shuffledChoices: Array<{ choice: string; originalIndex: number }>;
    onBookmarkToggle: (index: number) => void;
    onAnswerSelection: (answer: string) => void;
    onShortAnswerChange: (value: string) => void;
}

export default function QuizQuestion({
    currentQuestion,
    currentQuestionIndex,
    selectedQuestionTypes,
    shuffledChoices,
    onBookmarkToggle,
    onAnswerSelection,
    onShortAnswerChange
}: QuizQuestionProps) {
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
                            onBookmarkToggle(currentQuestionIndex);
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
            </div>
        </div>
    );
}
