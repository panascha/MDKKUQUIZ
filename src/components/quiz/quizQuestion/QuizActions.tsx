"use client";
import React from 'react';
import { Question } from '../../../types/api/Question';
import { CheckCircle, Cancel, ErrorOutline } from '@mui/icons-material';

interface QuizActionsProps {
    currentQuestion: Question;
    selectedQuestionTypes: string;
    answerMode: string;
    onSubmitCurrentQuestion: () => void;
    onClearAnswer: () => void;
}

export default function QuizActions({
    currentQuestion,
    selectedQuestionTypes,
    answerMode,
    onSubmitCurrentQuestion,
    onClearAnswer
}: QuizActionsProps) {
    return (
        <div className="flex flex-col gap-3 mt-6 w-full">
            {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && 
             answerMode === 'each-question' && 
             !currentQuestion.isSubmitted && 
             currentQuestion.isAnswered && (
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
            {(selectedQuestionTypes === 'mcq' || selectedQuestionTypes === 'shortanswer') && 
             answerMode === 'end-of-quiz' && 
             currentQuestion.isAnswered && (
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
    );
}
