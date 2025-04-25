import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import allQuestions from '../api/ImportQuestion';
import allsubjects from '../api/ImportSubject';
import transformUrl from '../utils/transformUrl'; // Create utils file
import { Link } from 'react-router-dom';


const QuizProblem = () => {
    const location = useLocation();

    const {
        quizType,
        selectedTopics,
        answerMode,
        questionCount,
        timerEnabled,
        timerDuration,
        selectedQuestionTypes,
        randomizedQuestions,
        questions,
    } = location.state || {}; // Get quiz parameters from the location state

    const { subjectName } = useParams(); // Get subject name
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null); // Store the current question
    const [userAnswers, setUserAnswers] = useState({}); // Store user answers
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(timerEnabled);
    const [topicName, setTopicName] = useState(""); // State to store the selected topic
    const timerIntervalRef = useRef(null);


    useEffect(() => {
        if (questions && questions.length > 0) {
            setCurrentQuestion(questions[currentQuestionIndex]);
        }
    }, [currentQuestionIndex, questions]);

    useEffect(() => {
        if (timerEnabled && timerRunning) {
            timerIntervalRef.current = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
        } else if (!timerRunning && timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
        return () => clearInterval(timerIntervalRef.current); // Cleanup interval on unmount
    }, [timerEnabled, timerRunning]);

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: answer,
        }));
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            // Quiz finished, calculate score
            calculateScore();
        }
    };
    const calculateScore = () => {
        let correctAnswers = 0;
        questions.forEach((question) => {
            if (userAnswers[question.id] === question.answer) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setTimerRunning(false); // Stop the timer
    };

    const handleFinishQuiz = () => {
        calculateScore();
    };

    const handleRestartQuiz = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(0);
        setTimer(0);
        setTimerRunning(timerEnabled);
    };



    return (
        <div className="container mx-auto p-4 mt-10">
            {currentQuestion && (
                <div className="mt-6">
                    <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
                    <img src={transformUrl(currentQuestion.image)} alt={currentQuestion.question} className="w-full h-auto mb-4" />
                    <div className="mb-4">
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="mb-2">
                                <input
                                    type="radio"
                                    id={`option-${index}`}
                                    name={`question-${currentQuestion.id}`}
                                    value={option}
                                    checked={userAnswers[currentQuestion.id] === option}
                                    onChange={() => handleAnswerChange(currentQuestion.id, option)}
                                />
                                <label htmlFor={`option-${index}`} className="ml-2">{option}</label>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleNextQuestion}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 ease-in-out"
                    >
                        Next Question
                    </button>
                </div>
            )}
            {currentQuestionIndex === questions.length - 1 && (
                <button
                    onClick={handleFinishQuiz}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300 ease-in-out"
                >
                    Finish Quiz
                </button>
            )}
            {score > 0 && (
                <div className="mt-6">
                    <h2 className="text-xl font-bold">Your Score: {score} / {questions.length}</h2>
                    <button
                        onClick={handleRestartQuiz}
                        className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition duration-300 ease-in-out"
                    >
                        Restart Quiz
                    </button>
                </div>
            )}
        </div>
    );
};

export default QuizProblem;