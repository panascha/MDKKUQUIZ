"use client";
import React from 'react';

interface QuizActionsProps {
    answerMode: string;
    allQuestionsAnswered: boolean;
    allQuestionsSubmitted: boolean;
    isSubmitting: boolean;
    onViewAllQuestions: () => void;
    onSubmitQuiz: () => void;
}

const QuizActions: React.FC<QuizActionsProps> = ({
    answerMode,
    allQuestionsAnswered,
    allQuestionsSubmitted,
    isSubmitting,
    onViewAllQuestions,
    onSubmitQuiz
}) => {
    return (
        <div className="flex justify-center gap-4 mt-8">
            <button
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={onViewAllQuestions}
            >
                View All Questions
            </button>
            {answerMode === 'end-of-quiz' && allQuestionsAnswered && (
                <button
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onSubmitQuiz}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Submit All & Go to Summary"}
                </button>
            )}
            {answerMode === 'each-question' && allQuestionsSubmitted && (
                <button
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm sm:text-base font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={onSubmitQuiz}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Submitting..." : "Go to Summary"}
                </button>
            )}
        </div>
    );
};

export default QuizActions;
