"use client";
import React from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';

interface QuizHeaderProps {
    subjectName: string;
    currentQuestionIndex: number;
    totalQuestions: number;
    seconds: number;
    isTimerVisible: boolean;
    onToggleTimer: () => void;
}

export default function QuizHeader({
    subjectName,
    currentQuestionIndex,
    totalQuestions,
    seconds,
    isTimerVisible,
    onToggleTimer
}: QuizHeaderProps) {
    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                {subjectName || 'Loading...'}
            </h1>
            <div className="flex justify-between items-center">
                <p className="text-base sm:text-lg text-gray-600 mt-2 sm:mt-4 font-medium">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                </p>
                <div className="flex items-center gap-2">
                    {isTimerVisible && (
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold shadow-sm">
                            Time: {formatTime(seconds)}
                        </div>
                    )}
                    <button
                        className="ml-2 px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition flex items-center justify-center"
                        onClick={onToggleTimer}
                        title={isTimerVisible ? 'Hide Timer' : 'Show Timer'}
                    >
                        {isTimerVisible ? <VisibilityOff /> : <Visibility />}
                    </button>
                </div>
            </div>
        </div>
    );
}
