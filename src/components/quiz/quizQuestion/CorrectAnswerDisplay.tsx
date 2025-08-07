"use client";
import React from 'react';
import { Question } from '../../../types/api/Question';

interface CorrectAnswerDisplayProps {
    currentQuestion: Question;
}

export default function CorrectAnswerDisplay({ currentQuestion }: CorrectAnswerDisplayProps) {
    if (!currentQuestion.isSubmitted) return null;

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 w-full">
            <p className="text-sm font-medium">
                Correct Answer: <span className="text-blue-600 font-semibold">
                    {Array.isArray(currentQuestion.quiz.correctAnswer) 
                        ? currentQuestion.quiz.correctAnswer.join(', ') 
                        : currentQuestion.quiz.correctAnswer}
                </span>
            </p>
        </div>
    );
}
