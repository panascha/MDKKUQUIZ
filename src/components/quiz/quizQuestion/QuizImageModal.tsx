"use client";
import React from 'react';
import ImageGallery from '../../magicui/ImageGallery';
import { Question } from '../../../types/api/Question';

interface QuizImageModalProps {
    isOpen: boolean;
    currentQuestion: Question;
    onClose: () => void;
}

export default function QuizImageModal({ isOpen, currentQuestion, onClose }: QuizImageModalProps) {
    if (!isOpen || !currentQuestion) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-xl p-4 sm:p-6 shadow-2xl max-w-[95%] sm:max-w-4xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none transform hover:scale-110 transition-transform duration-200"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="rounded-xl overflow-auto w-full h-full flex items-center justify-center relative bg-gray-50">
                        <ImageGallery 
                            images={currentQuestion.quiz.img}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
