import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Quiz } from '../../types/api/Quiz';
import ImageGallery from '../magicui/ImageGallery';

interface QuizzesTabProps {
    quizzes: Quiz[];
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}

const QuizzesTab: React.FC<QuizzesTabProps> = ({ quizzes, onApprove, onReject }) => {
    if (quizzes.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <p className="text-gray-500 text-center text-sm sm:text-base">No pending quizzes to review</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4 sm:space-y-6">
                {quizzes.map((quiz) => (
                    <Card key={quiz._id} className="p-4 sm:p-6 bg-white shadow-sm">
                        <div className="space-y-4">
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                                <div className="space-y-1 sm:space-y-2">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{quiz.question}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800">
                                            {quiz.subject.name}
                                        </span>
                                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-purple-100 text-purple-800">
                                            {quiz.type}
                                        </span>
                                        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-yellow-100 text-yellow-800">
                                            {quiz.category.category}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 sm:gap-3">
                                    <Button
                                        onClick={() => onApprove(quiz._id)}
                                        className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                        textButton="Approve"
                                    />
                                    <Button
                                        onClick={() => onReject(quiz._id)}
                                        className="flex-1 sm:flex-none bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                                        textButton="Reject"
                                    />
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="border-t pt-4 space-y-4">
                                {/* Images Section - Moved to top */}
                                {quiz.img.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Images:</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                            {quiz.img.map((image, index) => (
                                                <div 
                                                    key={index} 
                                                    className="relative aspect-video cursor-pointer group"
                                                >
                                                    <ImageGallery
                                                        images={[image]}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Choices */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Choices:</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {quiz.choice.map((choice, index) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded-md">
                                                <span className="font-medium text-gray-600">Option {index + 1}:</span> {choice}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Correct Answers */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Correct Answer(s):</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {quiz.correctAnswer.map((answer, index) => (
                                            <span key={index} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                                                {answer}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Submitted By */}
                                <div className="text-sm text-gray-500">
                                    Submitted by: {quiz.user.name}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </>
    );
};

export default QuizzesTab; 