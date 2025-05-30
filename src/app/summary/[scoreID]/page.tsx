'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ImageGallery from '@/components/magicui/ImageGallery';
import { useParams } from 'next/navigation';
import { UserScore, Question } from '@/types/api/Score';
import axios from 'axios';
import { BackendRoutes } from '@/config/apiRoutes';
import { useSession } from 'next-auth/react';
import { Subject } from '@/types/api/Subject';

const QuizResultPage = () => {
    const session = useSession();
    const params = useParams();
    const scoreID = params.scoreID;

    const [score, setScore] = useState<UserScore>();
    const [showDropdown, setShowDropdown] = useState(false);
    const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const toggleDropdown = () => setShowDropdown(!showDropdown);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleFilter = (filterType: 'all' | 'correct' | 'incorrect') => {
        setFilter(filterType);
        setShowDropdown(false);
    };

    const filteredQuestions = score?.Question.filter(question => {
        // First apply the filter (correct/incorrect)
        const filterMatch = filter === 'all' || 
            (filter === 'correct' && question.isCorrect) || 
            (filter === 'incorrect' && !question.isCorrect);

        // Then apply search if there's a search term
        if (!searchTerm.trim()) return filterMatch;

        const searchTerms = searchTerm.toLowerCase().split(' ');
        const questionText = question.Quiz.question.toLowerCase();
        const answerText = question.Answer.toLowerCase();
        const correctAnswerText = question.Quiz.correctAnswer.join(' ').toLowerCase();

        return filterMatch && searchTerms.every(term => 
            questionText.includes(term) || 
            answerText.includes(term) || 
            correctAnswerText.includes(term)
        );
    });

    useEffect(() => {
        const fetchQuestion = async () => {
            console.log(scoreID)
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
                console.log(response.data.data);
            } catch (error) {
                console.error("Error fetching question:", error);
            }
        };
        fetchQuestion();

    }, [scoreID, session?.data?.user.token]);

    return (
    <>
        <div className="container mx-auto mt-24 pt-20 md:mt-16 flex flex-col items-center justify-center">
        <div className="absolute text-lg font-bold top-8 md:top-12 left-8 md:left-10">
            <Link href="/" className="text-black hover:text-blue-500">
                Back to Main Page
            </Link>
        </div>

        <h1 className="text-3xl font-bold text-center mb-4">You nailed the quiz!</h1>

        <div className="bg-white md:shadow-md rounded-md p-6 w-96 border-none md:border-2 border-gray-300">
            <h2 className="text-xl font-bold mb-4">Quiz Result</h2>
            <p className="mb-2"><strong>Subject: </strong>{score?.Subject.name}</p>
            {/* <p className="mb-2"><strong>Username:</strong> Panas Chang</p> */}
            <p className="mb-2"><strong>Date / Time: </strong>{score?.createdAt ? new Date(score.createdAt).toLocaleString() : '' }</p>
            <p className="mb-2"><strong>Time Taken: </strong>{score?.timeTaken ? formatTime(Number(score.timeTaken)) : '00:00:00'}</p>
            <p className="mb-4 text-lg">
            <strong>Score: </strong> <span id="score">{score?.Score.toString()}</span> / <span id="total">{score?.FullScore.toString()}</span>
            </p>
        </div>

        {/* Filter Section */}
        <section className="flex flex-col md:flex-row gap-4 mt-3 mx-4 p-4 md:p-6 sm:mx-10 w-full md:w-2/3 items-end">
            <div className="flex flex-col gap-2 w-full md:w-7/10">
            <label htmlFor="search" className="text-sm md:text-md">
                Search:
                <small className="ml-2 text-gray-500">
                Try Pubmed search e.g. "strongyloides stercoralis" and/or/not "hookworm"
                </small>
            </label>
            <input
                id="search"
                type="text"
                placeholder="Search from Topic, Question, Choices, Your answer, Explanation"
                className="border border-gray-300 rounded-md p-2 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            </div>

            <div className="flex flex-row gap-4 w-full md:w-3/10">
                <div className="flex flex-col gap-2 w-1/2">
                    <label htmlFor="filter" className="text-sm md:text-md">Filter:</label>
                    <div className="relative w-full">
                    <button
                        className="bg-white border-gray-300 border-2 rounded-md p-2 flex items-center gap-2 justify-center h-full w-full hover:bg-gray-100 cursor-pointer sm:text-sm"
                        onClick={toggleDropdown}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                    {showDropdown && (
                        <div className="absolute bg-white border border-gray-300 rounded-md mt-2 w-full p-1 z-10 sm:text-sm">
                        <div className="p-2 hover:bg-green-100 cursor-pointer" onClick={() => handleFilter('all')}>All</div>
                        <div className="p-2 hover:bg-green-100 cursor-pointer" onClick={() => handleFilter('correct')}>Correct</div>
                        <div className="p-2 hover:bg-red-100 cursor-pointer" onClick={() => handleFilter('incorrect')}>Incorrect</div>
                        </div>
                    )}
                    </div>
                </div>

                {/* <div className="flex flex-col gap-2 w-1/2">
                    <label htmlFor="bookmark" className="text-sm md:text-md">Bookmark:</label>
                    <button className="bg-white text-white border-yellow-600 border-2 rounded-md p-2 flex items-center gap-2 justify-center hover:bg-yellow-100 cursor-pointer h-full w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v16l7-5 7 5V3H5z" />
                    </svg>
                    </button>
                </div> */}
            </div>
        </section>

        {/* Question Cards Section */}
        <section className="grid grid-cols-1 gap-6 mx-4 p-4 md:p-6 sm:mx-10 w-full md:w-2/3">
            {filteredQuestions?.map((question: Question, index: number) => (
            <div
                key={question.Quiz._id}
                className={`card ${!question.isCorrect ? 'bg-red-100' : 'bg-green-100'} shadow-md rounded-lg p-6 border-gray-400 border-2 relative`}
            >
                <div className={`absolute top-0 left-0 h-full w-1.5 ${!question.isCorrect ? 'bg-red-600' : 'bg-green-600'} rounded-l-md`} />
                <h3 className="text-lg font-bold mb-1 question-text">Question {question.Quiz.question}</h3>
                <p className="mb-1"><strong>Subject:</strong> {score?.Subject.name}</p>
                <p className="mb-2"><strong>Topic:</strong> {question.Quiz.category.category}</p>
                <p className="mb-3 text-center text-xl font-semibold">
                {question.Quiz.question}
                </p>
                <div className="flex flex-col md:flex-row items-center gap-8">
                <ImageGallery images={["/mdkkulogo.png"]} />
                <div className="md:order-2 md:w-2/3">
                    <p className="mb-1"><strong>Your Answer: </strong>{question.Answer}</p>
                    <p className="mb-1"><strong>Correct answer: </strong>{question.Quiz.correctAnswer}</p>
                    {/* <p className="mb-1"><strong>Possible:</strong> To circulate oxygen and nutrients</p> */}
                </div>
                </div>
                <div className="flex justify-end mt-4 md:mt-0 md:order-3">
                <button className="bg-orange-400 text-white rounded-md p-2 cursor-pointer hover:bg-orange-600 transition duration-300 ease-in-out">
                    Report
                </button>
                </div>
            </div>
            ))}
        </section>
        </div>
    </>
    );
};

export default QuizResultPage;
