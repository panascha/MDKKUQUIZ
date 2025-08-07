'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { UserScore, Question } from '../../../types/api/Score';
import axios from 'axios';
import { BackendRoutes } from '../../../config/apiRoutes';
import { useSession } from 'next-auth/react';
import { QuizResultHeader } from '../../../components/quiz/QuizResult/Header';
import { QuizResultFilter } from '../../../components/quiz/QuizResult/Filter';
import { QuizQuestionCard } from '../../../components/quiz/QuizResult/QuestionCard';
import ProtectedPage from '../../../components/ProtectPage';

const QuizResultPage = () => {
    const session = useSession();
    const params = useParams();
    const scoreID = params.scoreID;

    const [showModal, setShowModal] = useState<Boolean>(false);
    const [score, setScore] = useState<UserScore>();
    const [showDropdown, setShowDropdown] = useState(false);
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
    const [bookmarkFilter, setBookmarkFilter] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState('');
    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const filteredQuestions = score?.Question.filter(question => {
        // First apply the filter (correct/incorrect)
        const filterMatch = filter === 'all' || 
            (filter === 'correct' && question.isCorrect) || 
            (filter === 'incorrect' && !question.isCorrect);

        let bookmarkMatch = true;
        if (bookmarkFilter) {
            bookmarkMatch = question.isBookmarked;
        }

        // Then apply search if there's a search term
        if (!searchTerm.trim()) return filterMatch && bookmarkMatch;

        const searchTerms = searchTerm.toLowerCase().split(' ');
        const questionText = question.Quiz.question.toLowerCase();
        const answerText = question.Answer.toLowerCase();
        const categoryText = question.Quiz.category.category.toLowerCase();
        const choiceText = question.Quiz.choice.map(choice => choice.toLowerCase()).join(' ');
        const correctAnswerText = question.Quiz.correctAnswer.join(' ').toLowerCase();

        return filterMatch && bookmarkMatch && searchTerms.every(term => 
            questionText.includes(term) || 
            answerText.includes(term) || 
            categoryText.includes(term) ||
            choiceText.includes(term) ||
            correctAnswerText.includes(term)
        );
    });

    useEffect(() => {
        const fetchQuestion = async () => {
            if (!scoreID) return;
            try {
                const response = await axios.get(
                    `${BackendRoutes.SCORE}/${scoreID}`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${session.data?.user.token}`,
                        },
                    }
                );
                setScore(response.data.data);
            } catch (error) {
                console.error("Error fetching question:", error);
            }
        };
        fetchQuestion();
    }, [scoreID, session?.data?.user.token]);


    return (
        <ProtectedPage>
            <div className="container mx-auto mt-24 md:mt-16 flex flex-col items-center justify-center">
                <QuizResultHeader score={score} formatTime={formatTime} />

                <QuizResultFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    filter={filter}
                    setFilter={setFilter}
                    showDropdown={showDropdown}
                    toggleDropdown={toggleDropdown}
                    bookmarkFilter={bookmarkFilter}
                    setBookmarkFilter={setBookmarkFilter}
                />
                <section className="grid grid-cols-1 gap-6 mx-4 p-4 md:p-6 sm:mx-10 w-full md:w-2/3">
                    {filteredQuestions?.map((question: Question, index: number) => {
                        if (!question.Quiz || !question.Quiz._id || question.Quiz.status !== 'approved') {
                            return (
                                <div
                                    key={`error-${index}`}
                                    className="card bg-red-100 shadow-md rounded-lg p-6 border-gray-400 border-2 relative"
                                >
                                    <div className="absolute top-0 left-0 h-full w-1.5 bg-red-600 rounded-l-md" />
                                    <h3 className="text-lg font-bold mb-1 question-text">Question {index + 1}</h3>
                                    <div className="text-center py-8">
                                        <div className="text-red-600 text-6xl mb-4">
                                            ⚠️
                                        </div>
                                        <div className="text-red-600 text-xl font-semibold mb-2">
                                            Question Reported
                                        </div>
                                        <p className="text-red-700 text-lg">
                                            This question has been reported and cannot be displayed properly.
                                        </p>
                                        <p className="text-sm text-red-600 mt-4">
                                            Sorry for the inconvenience.
                                        </p>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <QuizQuestionCard
                                key={question.Quiz._id}
                                question={question}
                                index={index}
                            />
                        );
                    })}
                </section>
            </div>
        </ProtectedPage>
    );
};

export default QuizResultPage;
