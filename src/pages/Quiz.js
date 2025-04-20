// Quiz.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import allQuestions from '../api/ImportQuestion'; // Import allQuestions
import allsubjects from '../api/ImportSubject'; // Import allsubjects

const Quiz = () => {
    const { subjectName } = useParams();

    // API Data (Replace with actual API calls)
    const [topics, setTopics] = useState([]); // Initialize topics as an empty array
    const [maxQuestions, setMaxQuestions] = useState(0); // Initialize maxQuestions to 0
    // Quiz Type Options
    const quizTypes = ['chillquiz', 'realtest', 'custom'];
    // Answer Mode Options
    const answerModes = React.useMemo(() => ['one-by-one', 'all-at-once'], []);
    // Timer Duration Options
    const timerDurations = ['30 sec', '45 sec', '1 min', '1 min 15 sec', '1 min 30 sec'];

    // State Variables
    const [quizType, setQuizType] = useState('');
    const [selectedTopics, setSelectedTopics] = useState([]);
    const [answerMode, setAnswerMode] = useState('');
    const [questionCount, setQuestionCount] = useState(0);
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [timerDuration, setTimerDuration] = useState(timerDurations[0]); // Default: 30 sec
    const [questions, setQuestions] = useState([]); // State to store filtered questions
    const [questionTypes, setQuestionTypes] = useState([]); // New state for question types

    // Default Values (Using useMemo for optimization)
    const defaultValues_Question = React.useMemo(() => ({
        chillquiz: Math.min(10, Math.ceil(maxQuestions * 0.3)),
        realtest: Math.min(30, Math.ceil(maxQuestions * 0.8)),
        custom: maxQuestions,
    }), [maxQuestions]);

    const defaultValues_AnswerMode = React.useMemo(() => ({
        chillquiz: answerModes[0], // 'one-by-one'
        realtest: answerModes[1], // 'all-at-once'
        custom: answerModes[0], // 'one-by-one'
    }), [answerModes]);

    const defaultValues_QuestionType = React.useMemo(() => ({
        chillquiz: ['mcq'],
        realtest: ['mcq', 'short-answer'],
        custom: ['mcq', 'short-answer'],
    }), []);

    const defaultValues_TimerEnabled = React.useMemo(() => ({
        chillquiz: false,
        realtest: true,
        custom: false,
    }), []);
    // Event Handlers
    const handleQuizTypeChange = (type) => {
        setQuizType(type);
        setQuestionCount(defaultValues_Question[type] || 0);
        setAnswerMode(defaultValues_AnswerMode[type] || answerModes[0]); // Set default answer mode
        setQuestionTypes(defaultValues_QuestionType[type] || []); // Set default question types
        setTimerEnabled(defaultValues_TimerEnabled[type] || false); // Set default timer enabled

        console.log('maxQuestions', maxQuestions);
    };

    const handleTopicToggle = (topic) => {
        setSelectedTopics((prev) =>
            prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
        );
    };

    const handleAnswerModeChange = (mode) => {
        setAnswerMode(mode);
    };

    const handleQuestionCountChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 0) {
            setQuestionCount(Math.min(value, maxQuestions)); // Ensure question count does not exceed maxQuestions
        } else {
            setQuestionCount(0); // Reset to 0 if invalid input
        }

    };


    // Ensure initial question count does not exceed total available questions
    useEffect(() => {
        if (questionCount > maxQuestions) {
            setQuestionCount(maxQuestions);
        }
    }, [questionCount, maxQuestions]);

    const handleTimerDurationChange = (e) => {
        setTimerDuration(e.target.value);
    };

    const handleQuestionTypeToggle = (type) => {
        setQuestionTypes((prev) =>
            prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
        );
    };

    const handleStartQuiz = () => {
        if (!quizType || selectedTopics.length === 0 || !answerMode || questionCount <= 0 || questionTypes.length === 0 || questionCount > maxQuestions) {
            alert('Please complete all quiz settings before starting.');
            return;
        }
        console.log({
            quizType,
            selectedTopics,
            answerMode,
            questionCount,
            timerEnabled,
            timerDuration,
            questionTypes,
            questions // Log the questions being used
        });
        // Implement quiz start logic here (navigate to quiz page, etc.)
    };

    // useEffect Hook (Fetch Topics and Questions based on subjectName)
    useEffect(() => {
        // Fetch topics for the selected subject
        const selectedSubject = allsubjects.find(subject => subject.name.toLowerCase() === (subjectName || '').toLowerCase());
        if (selectedSubject) {
            setTopics(selectedSubject.topics || []);
        } else {
            setTopics('not found'); // Handle case where subject is not found
        }

        // Filter Questions based on selectedTopics and questionTypes
        const filteredQuestions = allQuestions.filter(question =>
            (!selectedTopics.length || selectedTopics.includes(question.topicId)) &&
            (!questionTypes.length || questionTypes.includes(question.type))
        );
        setQuestions(filteredQuestions);

        // Update maxQuestions only if filteredQuestions length changes
        if (filteredQuestions.length !== maxQuestions) {
            setMaxQuestions(filteredQuestions.length);
        }

    }, [subjectName, selectedTopics]);

    return (
        <div className="container p-6 rounded-lg mt-10 mx-auto animate-fade-in">
            <h1 className="text-4xl font-bold text-center mb-6 animate-slide-down">Quiz for {subjectName}</h1>
            {/* Topic Selection */}
            <div className="mb-6 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-semibold mb-2">Select Topics</h2>
                    <button
                        className="px-4 py-2 rounded-lg text-lg font-medium bg-secondary text-white transition-transform duration-300 transform hover:scale-105"
                        onClick={() => {
                            if (selectedTopics.length === topics.length) {
                                setSelectedTopics([]); // Deselect all
                            } else {
                                setSelectedTopics(topics.map(topic => topic.id)); // Select all
                            }
                        }}
                    >
                        {selectedTopics.length === topics.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-3 mb-3">

                    {topics.map((topic) => (
                        <button
                            key={topic.id}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-300 transform hover:scale-105 ${selectedTopics.includes(topic.id) ? 'bg-quaternary text-black' : 'bg-gray-300'}`}
                            onClick={() => handleTopicToggle(topic.id)}
                        >
                            {topic.name}
                        </button>
                    ))}
                </div>
            </div>
            {/* Quiz Type Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Choose Quiz Type</h2>
                <div className="grid grid-cols-3 gap-4">
                    {quizTypes.map((type) => (
                        <button
                            key={type}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${quizType === type ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                            onClick={() => handleQuizTypeChange(type)}
                        >
                            {type.charAt(0).toUpperCase() + type.slice(1).replace('quiz', ' Quiz')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Answer Mode Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Answer Mode</h2>
                <div className="grid grid-cols-2 gap-4">
                    {answerModes.map((mode) => (
                        <button
                            key={mode}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${answerMode === mode ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                            onClick={() => handleAnswerModeChange(mode)}
                        >
                            {mode.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Question Type Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Question Type</h2>
                <div className="grid grid-cols-2 gap-4">
                    {['mcq', 'short-answer'].map((type) => (
                        <button
                            key={type}
                            className={`px-4 py-2 rounded-lg text-lg font-medium transition-transform duration-300 transform hover:scale-105 ${questionTypes.includes(type) ? 'bg-secondary text-white' : 'bg-gray-300'}`}
                            onClick={() => handleQuestionTypeToggle(type)}
                        >
                            {type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Number of Questions Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Number of Questions</h2>
                <input
                    type="number"
                    className="border rounded-lg px-4 py-2 w-full text-lg"
                    value={questionCount}
                    onChange={handleQuestionCountChange}
                    placeholder={`Max: ${maxQuestions}`}
                />
                <p className="text-sm text-gray-600 mt-1">Selected Questions: {questionCount}</p>
                <p className="text-sm text-gray-600 mt-1">Total Questions Available: {questions.length}</p>
            </div>

            {/* Timer Selection */}
            <div className="mb-6 animate-fade-in">
                <h2 className="text-2xl font-semibold mb-2">Timer</h2>
                <label className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={timerEnabled}
                        onChange={(e) => setTimerEnabled(e.target.checked)}
                        className="w-5 h-5"
                    />
                    <span className="text-lg">Enable Timer</span>
                </label>
                {timerEnabled && (
                    <select
                        className="border rounded-lg px-4 py-2 mt-3 w-full text-lg"
                        value={timerDuration}
                        onChange={handleTimerDurationChange}
                    >
                        {timerDurations.map((duration) => (
                            <option key={duration} value={duration}>
                                {duration}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Start Quiz Button */}
            <button
                className="px-6 py-3 bg-secondary text-white rounded-lg text-lg font-bold w-full transition-transform duration-300 transform hover:scale-105 animate-fade-in"
                onClick={handleStartQuiz}
            >
                Start Quiz
            </button>
        </div>
    );
};

export default Quiz;