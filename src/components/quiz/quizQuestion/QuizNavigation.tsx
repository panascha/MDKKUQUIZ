"use client";
import React from 'react';

interface QuizNavigationProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    onNavigate: (direction: 'next' | 'previous') => void;
}

export default function QuizNavigation({
    currentQuestionIndex,
    totalQuestions,
    onNavigate
}: QuizNavigationProps) {
    return (
        <div className="flex justify-between items-center gap-3 sm:gap-4 mb-8">
            <button
                className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('previous');
                }}
                disabled={currentQuestionIndex === 0}
            >
                Previous
            </button>
            <button
                className="px-4 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('next');
                }}
                disabled={currentQuestionIndex === totalQuestions - 1}
            >
                Next
            </button>
        </div>
    );
}
