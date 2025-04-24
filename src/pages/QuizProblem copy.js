import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf'; // Import jsPDF
import { useParams, useLocation } from 'react-router-dom';
import transformUrl from '../utils/transformUrl'; // Create utils file
import { Link } from 'react-router-dom';


const QuizProblem = () => {
    const location = useLocation();

    const {
        quizType,
        selectedTopics,
        answerMode,
        questionCount,
        timerEnabled, // REMOVED timerDuration,
        selectedQuestionTypes,
        randomizedQuestions,
        questions: initialQuestions,
    } = location.state || {}; // Get quiz parameters from the location state

    const { subjectName } = useParams(); // Get subject name
    const [questions, setQuestions] = useState(initialQuestions || []); // Initialize state with props
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({}); // Store user answers
    const [score, setScore] = useState(0);
    // const [timer, setTimer] = useState(0); // REMOVED
    // const [timerRunning, setTimerRunning] = useState(timerEnabled); // REMOVED
    const [topicName, setTopicName] = useState(""); // State to store the selected topic
    // const timerIntervalRef = useRef(null); // REMOVED

    // Utility function to convert images to base64 (for PDF generation)
    const convertImgToBase64 = useCallback(async (url) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.height = img.naturalHeight;
                canvas.width = img.naturalWidth;
                ctx.drawImage(img, 0, 0);
                const dataURL = canvas.toDataURL('image/jpeg');
                resolve(dataURL);
            };
            img.onerror = reject;
            img.src = url;
        });
    }, []);

    // Function to handle reporting questions
    const handleReport = useCallback(() => {
        const reportText = prompt("Please enter your report for this question:");
        if (reportText) {
            saveReportToGoogleSheet(
                "QuizPage",
                topicName,
                questions[currentQuestionIndex].problem,
                reportText
            );
            alert("Report submitted successfully!");
        }
    }, [questions, currentQuestionIndex, topicName]);

    // Saving report to Google Sheet
    const saveReportToGoogleSheet = useCallback((from, topic, question, report) => {
        const url = "https://script.google.com/macros/s/AKfycbxe7wqLsPP6W9dM5RZAj9qs37Rp3mlHC-1eNywEnAQGgNqCtnL77t5xpSWgjq4Wcdh3/exec";
        const data = {
            from: from,
            topic: topic,
            question: question,
            report: report
        };

        fetch(url, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                console.log("Report saved to Google Sheet successfully");
            })
            .catch(error => {
                console.error("Error saving report to Google Sheet:", error);
            });
    }, []);


    // Function to save to PDF
    const saveToPDF = useCallback(async () => {
        const doc = new jsPDF();
        doc.setFontSize(12);
        doc.text(`Quiz Result - Subject: ${subjectName}`, 10, 10);

        let y = 30;

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const userAnswer = userAnswers[question._id] || "";

            // Check if question is defined
            if (question) {
                let questionText = `${i + 1}. ${question.problem}`;
                const imageHeight = 60; // Adjust this value to control image size

                // Add the image if there is one
                if (question.img) {
                    try {
                        const base64Img = await convertImgToBase64(transformUrl(question.img));
                        doc.addImage(base64Img, "JPEG", 10, y, 180, imageHeight); // Adjust x, y, w, h as needed
                        y += imageHeight + 10; // Set Y to be under the image
                        questionText = questionText.replace("\n", "");
                    } catch (error) {
                        console.error("Error loading image:", error);
                        // Add text without image
                        questionText = `${i + 1}. ${question.problem}`; // Adjust i to start at 1
                    }
                }

                let correctAnswerText = `Correct Answer: ${question.answer}`;
                let yourAnswerText = `Your Answer: ${userAnswer}`;

                // Set color based on correctness
                if (userAnswer.toLowerCase() === question.answer.toLowerCase()) {
                    doc.setTextColor(0, 100, 0); // Dark green for correct answers
                } else if (userAnswer !== "") {
                    doc.setTextColor(255, 0, 0); // Red for incorrect answers
                } else {
                    doc.setTextColor(0, 0, 0); // Black for unselected answers
                }

                // Add question and answers
                let questionLines = doc.splitTextToSize(questionText, 180); // Adjust 180 for your layout
                doc.setTextColor(0, 0, 0);
                doc.text(questionLines, 10, y);
                y += questionLines.length * 10 + 10; // Increase Y to account for the lines of text

                doc.setTextColor(0, 128, 0); // green
                let correctAnswerLines = doc.splitTextToSize(correctAnswerText, 180);
                doc.text(correctAnswerLines, 10, y);
                y += correctAnswerLines.length * 10 + 10; // Adjust 180 for your layout

                doc.setTextColor(0, 0, 0); // Reset to black
                let yourAnswerLines = doc.splitTextToSize(yourAnswerText, 180);
                doc.text(yourAnswerLines, 10, y);
                y += yourAnswerLines.length * 10 + 20; // Adjust 180 for your layout

            } else {
                console.warn(`Question at index ${i} is undefined.`); // Check to see why this is undefined
            }

            // If questions are too large, just add new page every 3 to 5 questions
            if (i > 0 && i % 4 === 0) {
                doc.addPage();
                y = 30; // Reset Y to the top of the new page
            }
        }
        doc.save(`quiz_result_${subjectName}.pdf`);
    }, [questions, userAnswers, convertImgToBase64, subjectName]);

    // Function to handle submitting an answer
    const handleAnswerSubmit = useCallback(() => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect =
            userAnswers[currentQuestion._id]?.toLowerCase().trim() ===
            currentQuestion.answer?.toLowerCase().trim();

        if (isCorrect) {
            setScore((prevScore) => prevScore + 1);
        }
        // Move to the next question
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
            // Quiz is complete, navigate to the end
            console.log('Quiz is Complete');
        }
        // clearTimeout(timerIntervalRef.current); // removing time out and the new question will get called
        // setTimer(0); // and the timer reset itself for each question
    }, [questions, currentQuestionIndex, userAnswers, score]);

    // const startTimer = useCallback(() => { // REMOVED
    //     if (timerRunning) {
    //         return; // Prevent starting multiple timers
    //     }

    //     timerIntervalRef.current = setInterval(() => {
    //         setTimer((prevTimer) => prevTimer + 1);
    //     }, 1000); // Update every 1 second

    //     setTimerRunning(true);
    // }, [timerRunning]);

    // const stopTimer = useCallback(() => { // REMOVED
    //     clearInterval(timerIntervalRef.current);
    //     setTimerRunning(false);
    // }, []);


    // const resetTimer = useCallback(() => { // REMOVED
    //     stopTimer();
    //     setTimer(0);
    // }, [stopTimer]);

    // useEffect(() => { // REMOVED
    //     resetTimer();
    //     startTimer();

    //     return () => {
    //         stopTimer(); // Clean up the timer when the component unmounts
    //     };
    // }, [currentQuestionIndex, startTimer, stopTimer, resetTimer]);



    // If questions are not loaded yet, display loading message
    const [loading, setLoading] = useState(false); // Add loading state
    const [error, setError] = useState(null); // Add error state

    // Initialize values from state.
    useEffect(() => {
        if (initialQuestions) {
            setQuestions(initialQuestions);
            if (initialQuestions.length > 0) {
                setTopicName(initialQuestions[0].topicId);
            }
        }
    }, [initialQuestions]);

    if (loading) {
        return <div className="text-center p-4">Loading questions...</div>;
    }

    // Error Message
    if (error) {
        return <div className="text-center p-4 text-red-500">Error loading questions: {error.message}</div>;
    }

    // If questions are not loaded yet, display loading message
    if (!questions || questions.length === 0) {
        return <div className="text-center p-4">No questions available for this topic.</div>;
    }

    // Get current question
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1; // checking index == last

    // Render short answer questions
    return (
        <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-blue-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
                <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
                    <h1 className="text-2xl font-bold text-gray-900 text-center">Quiz Time!</h1>
                    <p><b>Topic Name:</b>{topicName} </p>
                    {/*  <p>Time: {timer} Seconds</p>  REMOVED */}
                    <p className="text-md text-gray-500">
                        Question {currentQuestionIndex + 1} of {questions.length}
                    </p>
                    {/* Display quiz content  with short answer */}
                    {currentQuestion.type === "short_answer" && (
                        <div className="mt-4">
                            {/* Display the image if available */}
                            {currentQuestion.img && (
                                <div className="text-center">
                                    <img
                                        src={transformUrl(currentQuestion.img)}
                                        alt="Question Image"
                                        className="max-w-full h-auto rounded-lg mb-4"
                                        style={{ maxHeight: '200px' }}
                                    />
                                </div>
                            )}
                            <p className="text-xl font-semibold">{currentQuestion.problem}</p>
                            <textarea
                                className="w-full p-2 border rounded-md mt-2"
                                placeholder="Type your answer here..."
                                value={userAnswers[currentQuestion._id] || ""}
                                onChange={(e) =>
                                    setUserAnswers({
                                        ...userAnswers,
                                        [currentQuestion._id]: e.target.value,
                                    })
                                }
                            ></textarea>
                        </div>
                    )}
                    {/* Display quiz content with multiple choice */}
                    {currentQuestion.type === "mcq" && (
                        <div className="mt-4">
                            {/* Display the image if available */}
                            {currentQuestion.img && (
                                <div className="text-center">
                                    <img
                                        src={transformUrl(currentQuestion.img)}
                                        alt="Question Image"
                                        className="max-w-full h-auto rounded-lg mb-4"
                                        style={{ maxHeight: '200px' }}
                                    />
                                </div>
                            )}
                            <p className="text-xl font-semibold">{currentQuestion.problem}</p>
                            <div className="mt-2">
                                {currentQuestion.choices.split("///").map((choice, index) => (
                                    <button
                                        key={index}
                                        className={`block w-full p-2 rounded-md text-left hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${userAnswers[currentQuestion._id] === choice
                                            ? "bg-blue-200"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            setUserAnswers({
                                                ...userAnswers,
                                                [currentQuestion._id]: choice,
                                            })
                                        }
                                    >
                                        {choice}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="mt-6 flex justify-between">
                        {/* Previous button */}
                        <button
                            className={`px-4 py-2 text-gray-600 rounded-md hover:bg-gray-200 ${currentQuestionIndex === 0 ? "cursor-not-allowed opacity-50" : ""
                                }`}
                            onClick={() => {
                                setCurrentQuestionIndex(currentQuestionIndex - 1);
                                // clearTimeout(timerIntervalRef.current); // clearing time out and the new question will get called
                                // setTimer(0); // and the timer reset itself for each question
                            }}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </button>

                        {/* Next or Submit button */}
                        <button
                            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={handleAnswerSubmit}
                        >
                            {isLastQuestion ? "Submit Quiz" : "Next"}
                        </button>
                    </div>
                    <div className="mt-6 flex justify-between">
                        <button
                            className="px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            onClick={handleReport}
                        >
                            Report
                        </button>
                        <button
                            className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            onClick={saveToPDF}
                        >
                            Save PDF
                        </button>
                        <Link
                            to={{
                                pathname: `/endquiz`,
                                state: {
                                    score: score,
                                    totalQuestions: questions.length,
                                }
                            }}
                            className="px-6 py-3 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            End Result
                        </Link>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default QuizProblem;