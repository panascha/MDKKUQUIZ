"use client";
import React from 'react';
import { Question } from '../../../types/api/Question';
import { ViewList, ViewModule } from '@mui/icons-material';

interface QuizQuestionTableProps {
    isOpen: boolean;
    showQuestion: Question[];
    currentQuestionIndex: number;
    questionViewMode: 'grid' | 'list';
    onClose: () => void;
    onToggleViewMode: () => void;
    onNavigateToQuestion: (index: number) => void;
}

export default function QuizQuestionTable({
    isOpen,
    showQuestion,
    currentQuestionIndex,
    questionViewMode,
    onClose,
    onToggleViewMode,
    onNavigateToQuestion
}: QuizQuestionTableProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-[95%] w-full max-h-[90vh] overflow-auto p-6 sm:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">All Questions</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={onToggleViewMode}
                            className="focus:outline-none text-gray-500 hover:text-gray-700 transform hover:scale-110 transition-transform duration-200"
                            title="Change View"
                        >
                            {questionViewMode === 'grid' ? <ViewList className="text-xl" /> : <ViewModule className="text-xl" />}
                        </button>
                        <button
                            onClick={onClose}
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
                            onClick={() => onNavigateToQuestion(index)}
                        >
                            {index + 1}. {q.quiz.question.substring(0, 25)}{q.quiz.question.length > 25 ? '...' : ''}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
