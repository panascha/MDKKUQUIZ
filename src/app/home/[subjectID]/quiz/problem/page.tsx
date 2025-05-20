"use client";
import React from 'react';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { BackendRoutes } from '@/config/apiRoutes';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { Card } from '@/components/ui/Card';
import { Question } from '@/types/api/Question';
import { Quiz } from '@/types/api/Quiz';
import ProtectedPage from '@/components/ProtectPage';

export default function Problem(){
    const session = useSession();
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const subjectID = params.subjectID;

    const quizType = searchParams.get('quizType');
    const answerMode = searchParams.get('answerMode');
    const questionCount = Number(searchParams.get('questionCount'));
    const selectedQuestionTypes = searchParams.get('questionType');
    const selectCategory = (searchParams.get('categories') || '').split(',').filter(Boolean);
    
    // Fetch question filter by searchParams

    const [question, setQuestion] = useState<Question[]>([]);

    // Helper to map API data to Question interface with quiz property
    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const response = await axios.get(
                    BackendRoutes.QUIZ_FILTER.replace(":subjectID", String(subjectID)),
                    {
                        params: {
                            quizType,
                            answerMode,
                            questionCount,
                            questionType: selectedQuestionTypes,
                            categories: selectCategory,
                        },
                        headers: {
                            Authorization: `Bearer ${session?.data?.user.token}`,
                        },
                    }
                );
                const mapToQuestion = (data: any[]): Question[] => {
                    return data.map((item) => ({
                        quiz: item,
                        select: null,
                        isBookmarked: false,
                        isAnswered: false,
                        isSubmitted: false,
                        isCorrect: null,
                    }));
                };
                setQuestion(mapToQuestion(response.data.data));
            } catch (error) {
                console.error("Error fetching question:", error);
            }
        };

        fetchQuestion();
    }, [subjectID, quizType, answerMode, questionCount, selectedQuestionTypes, selectCategory, session?.data?.user.token]);

    return (
        <ProtectedPage>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 mx-auto">
            <h1>Problem</h1>
            <p>Subject ID: {subjectID}</p>
            <p>Quiz Type: {quizType}</p>
            <p>Answer Mode: {answerMode}</p>
            <p>Question Count: {questionCount}</p>
            <p>Selected Question Types: {selectedQuestionTypes}</p>
            <p>Selected Categories: {selectCategory.join(', ')}</p>
            <Card className="px-10 py-2 bg-white shadow-md rounded-lg w-1/2">
                {question.map((item, index) => (
                    <div key={index} className="mb-4">
                        <h2 className="font-semibold">{item.quiz?.question}</h2>
                        <p className="text-gray-600">Correct Answer: {item.quiz?.correctAnswer}</p>
                        <p className="text-gray-600">Your Answer: {item.select}</p>
                        <p className="text-gray-600">Is Bookmarked: {item.isBookmarked ? 'Yes' : 'No'}</p>
                        <p className="text-gray-600">Is Answered: {item.isAnswered ? 'Yes' : 'No'}</p>
                        <p className="text-gray-600">Is Submitted: {item.isSubmitted ? 'Yes' : 'No'}</p>
                        <p className="text-gray-600">Is Correct: {item.isCorrect ? 'Yes' : 'No'}</p>
                    </div>
                ))}
            </Card>
            {/* Add your quiz problem logic here */}
            </div>
            </ProtectedPage>
    );
};