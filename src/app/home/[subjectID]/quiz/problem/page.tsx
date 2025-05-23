"use client";
import React, { useCallback, useMemo } from 'react';
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
    const selectCategory = useMemo(() => (
    (searchParams.get('categories') || '').split(',').filter(Boolean)
    ), [searchParams]);
    const [question, setQuestion] = useState<Question[]>([]);
    const [showQuestion, setShowQuestion] = useState<Question[]>([])

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!subjectID) return;
            try {
                const response = await axios.get(
                    BackendRoutes.QUIZ_FILTER.replace(":subjectID", String(subjectID)),
                    {
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

    }, [subjectID, session?.data?.user.token]);


    const getRandomQuestion = useCallback((array: Question[], count: number) => {
        const shuffled = [...array].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }, []);

    useEffect(() => {
        if (question.length === 0) return;

        const filtered = question.filter((item) =>
            selectCategory.includes(item.quiz.category)
        );

        console.log("Questions:", question.slice(0, 3));
        console.log("Category IDs from questions:", question.map(q => q.quiz.category));
        console.log("selectCategory:", selectCategory);
        console.log("filtered", filtered);
        const selected = getRandomQuestion(filtered, questionCount);
        setShowQuestion(selected);
    }, [question, questionCount, selectCategory]);
    return(
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
                {showQuestion.map((item, index) => (
                    <div key={index} className="mb-4">
                        <h2 className="font-semibold">{item.quiz?.question}</h2>
                        <p className="text-gray-600">Correct Answer: {item.quiz?.correctAnswer}</p>
                        <p className="text-gray-600">Your Answer: {item.select}</p>
                        {/* <p className="text-gray-600">Is Bookmarked: {item.isBookmarked ? 'Yes' : 'No'}</p> */}
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